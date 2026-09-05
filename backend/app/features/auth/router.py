from fastapi import APIRouter, Depends, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.features.auth.dependencies import get_current_user
from app.features.auth.models import User
from app.features.auth.schemas import (
    AuthResponse,
    ChangePasswordRequest,
    ForgotPasswordRequest,
    LoginRequest,
    RefreshTokenRequest,
    RegisterRequest,
    ResetPasswordRequest,
    TokenResponse,
    UserProfileResponse,
    VerifyOtpRequest,
    VerifyOtpResponse,
)
from app.features.auth.service import AuthService
from app.shared.base_schema import MessageResponse

router = APIRouter(prefix="/auth", tags=["Authentication"])


@router.post(
    "/register",
    response_model=AuthResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Tenant Self-Registration",
    description="Registers a new Organization and creates its initial Administrator user.",
)
async def register(
    req: RegisterRequest,
    db: AsyncSession = Depends(get_db),
) -> AuthResponse:
    service = AuthService(db)
    return await service.register(req)


@router.post(
    "/login",
    response_model=AuthResponse,
    summary="User Login",
    description="Authenticates user with email & password, returning user profile, organization, and JWT tokens.",
)
async def login(
    req: LoginRequest,
    db: AsyncSession = Depends(get_db),
) -> AuthResponse:
    service = AuthService(db)
    return await service.login(req)


@router.post(
    "/refresh-token",
    response_model=TokenResponse,
    summary="Refresh Access Token",
    description="Exchanges a valid refresh token for new access and refresh tokens, verifying token_version.",
)
async def refresh_token(
    req: RefreshTokenRequest,
    db: AsyncSession = Depends(get_db),
) -> TokenResponse:
    service = AuthService(db)
    return await service.refresh_tokens(req)


@router.post(
    "/forgot-password",
    response_model=MessageResponse,
    summary="Request Password Reset OTP",
    description="Generates a 6-digit OTP code and dispatches it via email. Always returns a success message.",
)
async def forgot_password(
    req: ForgotPasswordRequest,
    db: AsyncSession = Depends(get_db),
) -> MessageResponse:
    service = AuthService(db)
    await service.forgot_password(req)
    return MessageResponse(
        message="If this email is registered in our system, a verification OTP code has been dispatched."
    )


@router.post(
    "/verify-otp",
    response_model=VerifyOtpResponse,
    summary="Verify OTP Code",
    description="Validates the OTP code received by email and issues a temporary single-use reset token.",
)
async def verify_otp(
    req: VerifyOtpRequest,
    db: AsyncSession = Depends(get_db),
) -> VerifyOtpResponse:
    service = AuthService(db)
    return await service.verify_otp(req)


@router.post(
    "/reset-password",
    response_model=MessageResponse,
    summary="Reset Password",
    description="Sets a new password using the reset token and invalidates all prior login sessions.",
)
async def reset_password(
    req: ResetPasswordRequest,
    db: AsyncSession = Depends(get_db),
) -> MessageResponse:
    service = AuthService(db)
    await service.reset_password(req)
    return MessageResponse(
        message="Password has been reset successfully. All existing sessions have been invalidated."
    )


@router.post(
    "/change-password",
    response_model=MessageResponse,
    summary="Change Password (Authenticated)",
    description="Allows authenticated users to change their password, immediately bumping token_version to invalidate prior sessions.",
)
async def change_password(
    req: ChangePasswordRequest,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> MessageResponse:
    service = AuthService(db)
    await service.change_password(current_user, req)
    return MessageResponse(
        message="Password updated successfully. Other active sessions have been invalidated."
    )


@router.get(
    "/me",
    response_model=UserProfileResponse,
    summary="Get Current Authenticated User",
    description="Returns the profile and organization details of the current authenticated user.",
)
async def get_me(
    current_user: User = Depends(get_current_user),
) -> UserProfileResponse:
    return UserProfileResponse.model_validate(current_user)
