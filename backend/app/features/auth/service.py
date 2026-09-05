from datetime import datetime, timedelta, timezone
from typing import Tuple
import uuid
import jwt
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.config import settings
from app.core.exceptions import (
    ConflictError,
    ForbiddenError,
    NotFoundError,
    UnauthorizedError,
    ValidationError,
)
from app.core.mailer import send_email
from app.core.security import (
    create_access_token,
    create_refresh_token,
    decode_token,
    generate_otp,
    hash_otp,
    hash_password,
    verify_otp,
    verify_password,
)
from app.features.auth.models import Organization, User
from app.features.auth.schemas import (
    AuthResponse,
    ChangePasswordRequest,
    ForgotPasswordRequest,
    LoginRequest,
    OrganizationResponse,
    RefreshTokenRequest,
    RegisterRequest,
    ResetPasswordRequest,
    TokenResponse,
    UserResponse,
    VerifyOtpRequest,
    VerifyOtpResponse,
)
from app.shared.enums import OrganizationStatus, UserRole, UserStatus


class AuthService:
    def __init__(self, db: AsyncSession):
        self.db = db

    def _generate_tokens(self, user: User, organization_id: uuid.UUID) -> TokenResponse:
        access_token = create_access_token(
            user_id=user.id,
            org_id=organization_id,
            role=user.role.value if hasattr(user.role, "value") else str(user.role),
            token_version=user.token_version,
        )
        refresh_token = create_refresh_token(
            user_id=user.id,
            token_version=user.token_version,
        )
        return TokenResponse(
            access_token=access_token,
            refresh_token=refresh_token,
            token_type="bearer",
            expires_in=settings.ACCESS_TOKEN_EXPIRE_MINUTES * 60,
        )

    async def register(self, req: RegisterRequest) -> AuthResponse:
        """Tenant self-registration: creates Organization + first User(role=ADMIN)."""
        # 1. Check if organization code is unique
        org_code = req.org_code.strip().upper()
        existing_org = await self.db.execute(
            select(Organization).where(Organization.code == org_code)
        )
        if existing_org.scalar_one_or_none():
            raise ConflictError(f"Organization with code '{org_code}' already exists.")

        # 2. Check if admin email is unique
        admin_email = req.admin_email.strip().lower()
        existing_user = await self.db.execute(
            select(User).where(User.email == admin_email)
        )
        if existing_user.scalar_one_or_none():
            raise ConflictError(f"User with email '{admin_email}' already exists.")

        # 3. Create Organization
        org = Organization(
            name=req.org_name.strip(),
            code=org_code,
            email=req.org_email.strip().lower(),
            phone=req.phone,
            currency=req.currency.strip().upper(),
            timezone=req.timezone.strip(),
            country=req.country.strip(),
            address=req.address,
            status=OrganizationStatus.ACTIVE,
        )
        self.db.add(org)
        await self.db.flush()  # populate org.id

        # 4. Create first User as ADMIN
        user = User(
            organization_id=org.id,
            email=admin_email,
            password_hash=hash_password(req.password),
            role=UserRole.ADMIN,
            status=UserStatus.ACTIVE,
            token_version=0,
        )
        self.db.add(user)
        await self.db.commit()
        await self.db.refresh(org)
        await self.db.refresh(user)

        # 5. Dispatch Welcome Email
        send_email(
            to=user.email,
            subject=f"Welcome to {settings.PROJECT_NAME} (WageWise) - {org.name}",
            body=(
                f"Hello Admin,\n\n"
                f"Your organization '{org.name}' ({org.code}) has been set up successfully on {settings.PROJECT_NAME}.\n"
                f"You can now access your HR & Payroll platform dashboard."
            ),
        )

        tokens = self._generate_tokens(user, org.id)
        return AuthResponse(
            user=UserResponse.model_validate(user),
            organization=OrganizationResponse.model_validate(org),
            tokens=tokens,
        )

    async def login(self, req: LoginRequest) -> AuthResponse:
        """Authenticate user with email/password and update last_login timestamp."""
        email = req.email.strip().lower()
        stmt = select(User).where(User.email == email)
        res = await self.db.execute(stmt)
        user = res.scalar_one_or_none()

        if not user or not verify_password(req.password, user.password_hash):
            raise UnauthorizedError("Invalid email or password")

        if user.status != UserStatus.ACTIVE:
            raise ForbiddenError("User account is inactive or suspended")

        if user.organization and user.organization.status != OrganizationStatus.ACTIVE:
            raise ForbiddenError("Organization is currently suspended")

        # Update last login
        user.last_login = datetime.now(timezone.utc)
        await self.db.commit()
        await self.db.refresh(user)

        tokens = self._generate_tokens(user, user.organization_id)
        return AuthResponse(
            user=UserResponse.model_validate(user),
            organization=OrganizationResponse.model_validate(user.organization),
            tokens=tokens,
        )

    async def refresh_tokens(self, req: RefreshTokenRequest) -> TokenResponse:
        """Exchange valid refresh token for a fresh access + refresh token pair."""
        payload = decode_token(req.refresh_token)
        if payload.get("type") != "refresh":
            raise UnauthorizedError("Invalid token type (expected refresh token)")

        user_id_str = payload.get("sub")
        token_version = payload.get("token_version", 0)

        try:
            user_uuid = uuid.UUID(user_id_str)
        except (ValueError, TypeError):
            raise UnauthorizedError("Invalid token subject")

        stmt = select(User).where(User.id == user_uuid)
        res = await self.db.execute(stmt)
        user = res.scalar_one_or_none()

        if not user or user.status != UserStatus.ACTIVE:
            raise UnauthorizedError("User account not found or inactive")

        if user.token_version != token_version:
            raise UnauthorizedError("Refresh token has been invalidated (please log in again)")

        return self._generate_tokens(user, user.organization_id)

    async def forgot_password(self, req: ForgotPasswordRequest) -> None:
        """Generate OTP, store hash + expiry against user, and email via mailer."""
        email = req.email.strip().lower()
        stmt = select(User).where(User.email == email)
        res = await self.db.execute(stmt)
        user = res.scalar_one_or_none()

        if not user:
            # Prevent email enumeration: return silently
            return

        otp = generate_otp()
        user.otp_code_hash = hash_otp(otp)
        user.otp_expires_at = datetime.now(timezone.utc) + timedelta(minutes=settings.OTP_EXPIRE_MINUTES)
        await self.db.commit()

        send_email(
            to=user.email,
            subject=f"Your {settings.PROJECT_NAME} Password Reset OTP",
            body=(
                f"Your password reset verification code is:\n\n"
                f"  ==> {otp} <==\n\n"
                f"This code will expire in {settings.OTP_EXPIRE_MINUTES} minutes.\n"
                f"If you did not request this, please ignore this message."
            ),
        )

    async def verify_otp(self, req: VerifyOtpRequest) -> VerifyOtpResponse:
        """Check OTP hash + expiry; issue a short-lived single-use reset token."""
        email = req.email.strip().lower()
        stmt = select(User).where(User.email == email)
        res = await self.db.execute(stmt)
        user = res.scalar_one_or_none()

        if not user or not user.otp_code_hash or not user.otp_expires_at:
            raise ValidationError("Invalid or expired OTP code")

        now = datetime.now(timezone.utc)
        expires_at = user.otp_expires_at
        if expires_at.tzinfo is None:
            expires_at = expires_at.replace(tzinfo=timezone.utc)

        if expires_at < now:
            raise ValidationError("OTP code has expired")

        if not verify_otp(req.otp, user.otp_code_hash):
            raise ValidationError("Invalid OTP code")

        # Create short-lived reset token (valid for 15 mins)
        reset_token = jwt.encode(
            {
                "sub": str(user.id),
                "type": "password_reset",
                "token_version": user.token_version,
                "iat": now,
                "exp": now + timedelta(minutes=15),
            },
            settings.JWT_SECRET_KEY,
            algorithm=settings.JWT_ALGORITHM,
        )

        return VerifyOtpResponse(reset_token=reset_token)

    async def reset_password(self, req: ResetPasswordRequest) -> None:
        """Reset password with reset token; bumps token_version to invalidate prior sessions."""
        payload = decode_token(req.reset_token)
        if payload.get("type") != "password_reset":
            raise UnauthorizedError("Invalid reset token type")

        user_id_str = payload.get("sub")
        try:
            user_uuid = uuid.UUID(user_id_str)
        except (ValueError, TypeError):
            raise UnauthorizedError("Invalid user ID in reset token")

        stmt = select(User).where(User.id == user_uuid)
        res = await self.db.execute(stmt)
        user = res.scalar_one_or_none()

        if not user:
            raise NotFoundError("User not found")

        # Update password hash and bump token version
        user.password_hash = hash_password(req.new_password)
        user.token_version += 1
        user.otp_code_hash = None
        user.otp_expires_at = None
        user.must_change_password = False
        await self.db.commit()

    async def change_password(self, user: User, req: ChangePasswordRequest) -> None:
        """Authenticated password change: verifies current password, updates hash, bumps token_version."""
        if not verify_password(req.current_password, user.password_hash):
            raise ValidationError("Current password does not match")

        user.password_hash = hash_password(req.new_password)
        user.token_version += 1
        user.must_change_password = False
        await self.db.commit()
