from datetime import datetime
from typing import Optional
import uuid
from pydantic import EmailStr, Field

from app.shared.base_schema import BaseSchema, IDSchema, TimestampSchema
from app.shared.enums import OrganizationStatus, UserRole, UserStatus


class TokenResponse(BaseSchema):
    """JWT Token response schema."""
    access_token: str
    refresh_token: str
    token_type: str = "bearer"
    expires_in: int = 900  # 15 minutes


class OrganizationResponse(IDSchema, TimestampSchema):
    name: str
    code: str
    email: EmailStr
    phone: Optional[str] = None
    currency: str
    timezone: str
    country: str
    address: Optional[str] = None
    logo_url: Optional[str] = None
    status: OrganizationStatus


class UserResponse(IDSchema, TimestampSchema):
    organization_id: uuid.UUID
    email: EmailStr
    role: UserRole
    status: UserStatus
    token_version: int
    must_change_password: bool = False
    last_login: Optional[datetime] = None


class UserProfileResponse(UserResponse):
    organization: OrganizationResponse


class RegisterRequest(BaseSchema):
    """Tenant self-registration request (creates Organization + first ADMIN user)."""
    org_name: str = Field(..., min_length=2, max_length=255, description="Company / Organization Name")
    org_code: str = Field(..., min_length=2, max_length=50, description="Unique tenant slug / code (e.g. ACME)")
    org_email: EmailStr = Field(..., description="Organization primary email")
    phone: Optional[str] = Field(None, max_length=50)
    currency: str = Field(default="INR", max_length=10)
    timezone: str = Field(default="Asia/Kolkata", max_length=50)
    country: str = Field(default="India", max_length=100)
    address: Optional[str] = Field(None, max_length=500)
    
    # Admin User credentials
    admin_email: EmailStr = Field(..., description="Primary Administrator Email")
    password: str = Field(..., min_length=8, description="Admin password (min 8 chars)")


class LoginRequest(BaseSchema):
    email: EmailStr
    password: str = Field(..., description="User login password")


class RefreshTokenRequest(BaseSchema):
    refresh_token: str = Field(..., description="Valid refresh token")


class ForgotPasswordRequest(BaseSchema):
    email: EmailStr = Field(..., description="Registered user email")


class VerifyOtpRequest(BaseSchema):
    email: EmailStr = Field(..., description="Registered user email")
    otp: str = Field(..., min_length=6, max_length=6, description="6-digit numeric OTP")


class VerifyOtpResponse(BaseSchema):
    reset_token: str
    message: str = "OTP verified successfully. Use this reset_token to set your new password."


class ResetPasswordRequest(BaseSchema):
    reset_token: str = Field(..., description="Single-use reset token from /verify-otp")
    new_password: str = Field(..., min_length=8, description="New secure password (min 8 chars)")


class ChangePasswordRequest(BaseSchema):
    current_password: str = Field(..., description="Current password")
    new_password: str = Field(..., min_length=8, description="New password (min 8 chars)")


class AuthResponse(BaseSchema):
    user: UserResponse
    organization: OrganizationResponse
    tokens: TokenResponse
