from datetime import datetime, timedelta, timezone
import pytest
from fastapi import APIRouter, Depends
from httpx import AsyncClient
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.permissions import require_role
from app.core.security import hash_otp
from app.features.auth.models import User
from app.main import app
from app.shared.enums import UserRole

# Temporary test router to test require_role dependency
rbac_test_router = APIRouter(prefix="/api/v1/rbac-check", tags=["Test RBAC"])


@rbac_test_router.get("/admin-only")
async def admin_only_route(current_user: User = Depends(require_role(UserRole.ADMIN))):
    return {"message": "Welcome Admin", "user_id": str(current_user.id)}


@rbac_test_router.get("/payroll-manager-only")
async def payroll_manager_only_route(current_user: User = Depends(require_role(UserRole.HR_PAYROLL_MANAGER))):
    return {"message": "Welcome Payroll Manager", "user_id": str(current_user.id)}


app.include_router(rbac_test_router)


@pytest.mark.asyncio
async def test_tenant_registration_and_login(client: AsyncClient):
    # 1. Register new tenant (Organization + Admin user)
    reg_payload = {
        "org_name": "Acme Corp",
        "org_code": "ACME",
        "org_email": "contact@acme.com",
        "admin_email": "admin@acme.com",
        "password": "SuperSecretPassword123",
        "currency": "INR",
        "country": "India",
    }
    reg_res = await client.post("/api/v1/auth/register", json=reg_payload)
    assert reg_res.status_code == 201
    data = reg_res.json()
    assert "user" in data
    assert "organization" in data
    assert "tokens" in data
    assert data["user"]["email"] == "admin@acme.com"
    assert data["user"]["role"] == "ADMIN"
    assert data["organization"]["code"] == "ACME"
    assert data["organization"]["name"] == "Acme Corp"
    assert data["tokens"]["access_token"] is not None
    assert data["tokens"]["refresh_token"] is not None

    access_token = data["tokens"]["access_token"]
    refresh_token = data["tokens"]["refresh_token"]

    # 2. Login with credentials
    login_payload = {
        "email": "admin@acme.com",
        "password": "SuperSecretPassword123",
    }
    login_res = await client.post("/api/v1/auth/login", json=login_payload)
    assert login_res.status_code == 200
    login_data = login_res.json()
    assert login_data["user"]["email"] == "admin@acme.com"
    assert login_data["tokens"]["access_token"] is not None

    # 3. Access protected /me route
    me_res = await client.get(
        "/api/v1/auth/me",
        headers={"Authorization": f"Bearer {access_token}"},
    )
    assert me_res.status_code == 200
    me_data = me_res.json()
    assert me_data["email"] == "admin@acme.com"
    assert me_data["organization"]["code"] == "ACME"


@pytest.mark.asyncio
async def test_duplicate_registration_prevention(client: AsyncClient):
    reg_payload = {
        "org_name": "Beta Labs",
        "org_code": "BETALABS",
        "org_email": "contact@betalabs.com",
        "admin_email": "admin@betalabs.com",
        "password": "Password12345",
    }
    res1 = await client.post("/api/v1/auth/register", json=reg_payload)
    assert res1.status_code == 201

    # Duplicate Org Code
    dup_org_payload = {
        "org_name": "Beta Duplicate",
        "org_code": "BETALABS",
        "org_email": "other@betalabs.com",
        "admin_email": "different_admin@betalabs.com",
        "password": "Password12345",
    }
    res2 = await client.post("/api/v1/auth/register", json=dup_org_payload)
    assert res2.status_code == 409
    assert "error" in res2.json()

    # Duplicate Admin Email
    dup_email_payload = {
        "org_name": "Another Corp",
        "org_code": "ANOTHER",
        "org_email": "info@another.com",
        "admin_email": "admin@betalabs.com",
        "password": "Password12345",
    }
    res3 = await client.post("/api/v1/auth/register", json=dup_email_payload)
    assert res3.status_code == 409


@pytest.mark.asyncio
async def test_rbac_permission_checks(client: AsyncClient):
    # Register Admin
    reg_res = await client.post(
        "/api/v1/auth/register",
        json={
            "org_name": "RBAC Corp",
            "org_code": "RBACCORP",
            "org_email": "rbac@corp.com",
            "admin_email": "admin@rbac.com",
            "password": "AdminPassword123",
        },
    )
    admin_token = reg_res.json()["tokens"]["access_token"]

    # Admin accessing admin-only route -> 200
    res_admin = await client.get(
        "/api/v1/rbac-check/admin-only",
        headers={"Authorization": f"Bearer {admin_token}"},
    )
    assert res_admin.status_code == 200

    # Admin accessing payroll-manager-only route -> 200 (ADMIN has full privileges)
    res_admin_payroll = await client.get(
        "/api/v1/rbac-check/payroll-manager-only",
        headers={"Authorization": f"Bearer {admin_token}"},
    )
    assert res_admin_payroll.status_code == 200

    # Unauthorized access with no token -> 401
    res_unauth = await client.get("/api/v1/rbac-check/admin-only")
    assert res_unauth.status_code == 401


@pytest.mark.asyncio
async def test_refresh_token_rotation(client: AsyncClient):
    reg_res = await client.post(
        "/api/v1/auth/register",
        json={
            "org_name": "Refresh Org",
            "org_code": "REFORG",
            "org_email": "ref@org.com",
            "admin_email": "admin@reforg.com",
            "password": "Password12345",
        },
    )
    refresh_token = reg_res.json()["tokens"]["refresh_token"]

    # Exchange refresh token
    ref_res = await client.post(
        "/api/v1/auth/refresh-token",
        json={"refresh_token": refresh_token},
    )
    assert ref_res.status_code == 200
    data = ref_res.json()
    assert "access_token" in data
    assert "refresh_token" in data


@pytest.mark.asyncio
async def test_forgot_and_reset_password_flow(client: AsyncClient, db_session: AsyncSession):
    # Register tenant
    await client.post(
        "/api/v1/auth/register",
        json={
            "org_name": "Reset Org",
            "org_code": "RESETORG",
            "org_email": "reset@org.com",
            "admin_email": "user@resetorg.com",
            "password": "OldPassword123",
        },
    )

    # 1. Request Forgot Password (generates OTP and hashes it)
    forgot_res = await client.post(
        "/api/v1/auth/forgot-password",
        json={"email": "user@resetorg.com"},
    )
    assert forgot_res.status_code == 200

    # 2. Test invalid OTP -> 422
    invalid_otp_res = await client.post(
        "/api/v1/auth/verify-otp",
        json={"email": "user@resetorg.com", "otp": "000000"},
    )
    assert invalid_otp_res.status_code in [400, 422]

    # 3. Deterministically set OTP in DB to test the rest of the flow
    user_stmt = select(User).where(User.email == "user@resetorg.com")
    user_res = await db_session.execute(user_stmt)
    user = user_res.scalar_one()
    user.otp_code_hash = hash_otp("123456")
    user.otp_expires_at = datetime.now(timezone.utc) + timedelta(minutes=10)
    await db_session.commit()

    # 4. Verify valid OTP -> returns reset_token
    verify_res = await client.post(
        "/api/v1/auth/verify-otp",
        json={"email": "user@resetorg.com", "otp": "123456"},
    )
    assert verify_res.status_code == 200
    reset_token = verify_res.json()["reset_token"]
    assert reset_token is not None

    # 5. Reset Password using reset_token
    reset_res = await client.post(
        "/api/v1/auth/reset-password",
        json={"reset_token": reset_token, "new_password": "NewSecurePassword789"},
    )
    assert reset_res.status_code == 200

    # 6. Log in with new password
    new_login_res = await client.post(
        "/api/v1/auth/login",
        json={"email": "user@resetorg.com", "password": "NewSecurePassword789"},
    )
    assert new_login_res.status_code == 200


@pytest.mark.asyncio
async def test_change_password_invalidates_old_tokens(client: AsyncClient):
    # Register
    reg_res = await client.post(
        "/api/v1/auth/register",
        json={
            "org_name": "Change Pass Org",
            "org_code": "CPORG",
            "org_email": "cp@org.com",
            "admin_email": "admin@cporg.com",
            "password": "OriginalPassword123",
        },
    )
    old_access_token = reg_res.json()["tokens"]["access_token"]
    old_refresh_token = reg_res.json()["tokens"]["refresh_token"]

    # Change password
    change_res = await client.post(
        "/api/v1/auth/change-password",
        headers={"Authorization": f"Bearer {old_access_token}"},
        json={
            "current_password": "OriginalPassword123",
            "new_password": "BrandNewPassword456",
        },
    )
    assert change_res.status_code == 200

    # Prior access token is now rejected because token_version was bumped!
    me_res = await client.get(
        "/api/v1/auth/me",
        headers={"Authorization": f"Bearer {old_access_token}"},
    )
    assert me_res.status_code == 401

    # Prior refresh token is also rejected!
    ref_res = await client.post(
        "/api/v1/auth/refresh-token",
        json={"refresh_token": old_refresh_token},
    )
    assert ref_res.status_code == 401

    # Login with new password succeeds
    login_res = await client.post(
        "/api/v1/auth/login",
        json={"email": "admin@cporg.com", "password": "BrandNewPassword456"},
    )
    assert login_res.status_code == 200
