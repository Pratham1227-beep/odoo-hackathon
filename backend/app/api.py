from fastapi import APIRouter

from app.core.audit import router as audit_router
from app.features.attendance.router import (
    attendance_router,
    holidays_router,
)
from app.features.auth.router import router as auth_router
from app.features.contracts.router import router as contracts_router
from app.features.employees.router import router as employees_router
from app.features.notifications.router import router as notifications_router
from app.features.organization.router import router as organization_router
from app.features.payroll.router import router as payroll_router
from app.features.payroll_config.router import router as payroll_config_router
from app.features.reports_dashboard.router import router as reports_dashboard_router
from app.features.time_off.router import router as time_off_router

api_router = APIRouter()

# Mount feature routers under /api/v1
api_router.include_router(auth_router)
api_router.include_router(organization_router)
api_router.include_router(employees_router)
api_router.include_router(payroll_config_router)
api_router.include_router(payroll_router)
api_router.include_router(contracts_router)
api_router.include_router(attendance_router)
api_router.include_router(holidays_router)
api_router.include_router(time_off_router)
api_router.include_router(notifications_router)
api_router.include_router(reports_dashboard_router)
api_router.include_router(audit_router)





