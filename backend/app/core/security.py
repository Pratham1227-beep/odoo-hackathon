from datetime import datetime, timedelta, timezone
import hashlib
import secrets
from typing import Any, Optional
import uuid
import bcrypt
import jwt

from app.core.config import settings
from app.core.exceptions import UnauthorizedError


def hash_password(password: str) -> str:
    """Hash plain text password using bcrypt."""
    pw_bytes = password.encode("utf-8")
    salt = bcrypt.gensalt()
    return bcrypt.hashpw(pw_bytes, salt).decode("utf-8")


def verify_password(plain_password: str, hashed_password: str) -> bool:
    """Verify plain password against hashed password."""
    try:
        pw_bytes = plain_password.encode("utf-8")
        hashed_bytes = hashed_password.encode("utf-8")
        return bcrypt.checkpw(pw_bytes, hashed_bytes)
    except Exception:
        return False


def create_access_token(
    user_id: uuid.UUID | str,
    org_id: uuid.UUID | str,
    role: str,
    token_version: int = 0,
    expires_delta: Optional[timedelta] = None,
) -> str:
    """Create JWT access token containing user_id, org_id, role, and token_version."""
    now = datetime.now(timezone.utc)
    expire = now + (expires_delta or timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES))

    to_encode: dict[str, Any] = {
        "sub": str(user_id),
        "org_id": str(org_id),
        "role": str(role),
        "token_version": token_version,
        "type": "access",
        "iat": now,
        "exp": expire,
    }
    return jwt.encode(to_encode, settings.JWT_SECRET_KEY, algorithm=settings.JWT_ALGORITHM)


def create_refresh_token(
    user_id: uuid.UUID | str,
    token_version: int = 0,
    expires_delta: Optional[timedelta] = None,
) -> str:
    """Create JWT refresh token containing user_id and token_version."""
    now = datetime.now(timezone.utc)
    expire = now + (expires_delta or timedelta(days=settings.REFRESH_TOKEN_EXPIRE_DAYS))

    to_encode: dict[str, Any] = {
        "sub": str(user_id),
        "token_version": token_version,
        "type": "refresh",
        "iat": now,
        "exp": expire,
    }
    return jwt.encode(to_encode, settings.JWT_SECRET_KEY, algorithm=settings.JWT_ALGORITHM)


def decode_token(token: str) -> dict[str, Any]:
    """Decode and validate JWT token. Raises UnauthorizedError on expiry or invalid signature."""
    try:
        payload = jwt.decode(
            token,
            settings.JWT_SECRET_KEY,
            algorithms=[settings.JWT_ALGORITHM],
        )
        return payload
    except jwt.ExpiredSignatureError:
        raise UnauthorizedError("Token has expired")
    except jwt.PyJWTError as e:
        raise UnauthorizedError(f"Invalid token: {str(e)}")


def generate_otp(length: int = 6) -> str:
    """Generate a random 6-digit numeric OTP."""
    digits = [str(secrets.randbelow(10)) for _ in range(length)]
    return "".join(digits)


def hash_otp(otp: str) -> str:
    """Hash OTP using SHA-256 (fast & secure for short-lived numeric codes)."""
    return hashlib.sha256(otp.encode("utf-8")).hexdigest()


def verify_otp(plain_otp: str, hashed_otp: str) -> bool:
    """Verify plain OTP matches SHA-256 hash."""
    return hash_otp(plain_otp) == hashed_otp
