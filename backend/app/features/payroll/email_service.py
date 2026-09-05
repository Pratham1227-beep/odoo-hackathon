from datetime import datetime, timezone
import logging
from typing import List
import uuid
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.mailer import send_email
from app.features.payroll.models import Payslip, PayslipDelivery
from app.features.payroll.pdf import generate_payslip_pdf
from app.shared.enums import DeliveryStatus

logger = logging.getLogger("payroll.email")


async def send_payslip_emails_for_payrun(
    db: AsyncSession,
    payslips: List[Payslip],
) -> List[PayslipDelivery]:
    """Bulk email delivery of generated payslips with per-recipient error resilience."""
    deliveries: List[PayslipDelivery] = []

    for slip in payslips:
        emp = slip.employee
        recipient_email = emp.email if emp else None

        if not recipient_email:
            delivery = PayslipDelivery(
                organization_id=slip.organization_id,
                payslip_id=slip.id,
                recipient_email="unknown@domain.com",
                delivery_type="EMAIL",
                status=DeliveryStatus.FAILED,
                failure_reason="Employee has no email address configured",
            )
            db.add(delivery)
            deliveries.append(delivery)
            continue

        try:
            # 1. Generate & cache PDF
            pdf_path, _ = generate_payslip_pdf(slip)
            slip.pdf_url = pdf_path

            # 2. Email payload
            period_label = f"{slip.period_start.strftime('%B %Y')}" if hasattr(slip.period_start, "strftime") else str(slip.period_start)
            emp_name = emp.first_name if emp else "Employee"
            subject = f"Your Payslip for {period_label} [{slip.payslip_number}]"
            body = (
                f"<p>Dear {emp_name},</p>"
                f"<p>Your payslip for the pay period <b>{slip.period_start} to {slip.period_end}</b> is attached and available for review.</p>"
                f"<ul>"
                f"<li><b>Payslip Number:</b> {slip.payslip_number}</li>"
                f"<li><b>Gross Earnings:</b> INR {slip.gross_salary:,.2f}</li>"
                f"<li><b>Total Deductions:</b> INR {slip.total_deductions:,.2f}</li>"
                f"<li><b>Net Payable Salary:</b> INR {slip.net_salary:,.2f}</li>"
                f"</ul>"
                f"<p>Best regards,<br/>Payroll & HR Operations Team</p>"
            )

            # 3. Dispatch via mailer
            send_email(to=recipient_email, subject=subject, body=body)

            delivery = PayslipDelivery(
                organization_id=slip.organization_id,
                payslip_id=slip.id,
                recipient_email=recipient_email,
                delivery_type="EMAIL",
                status=DeliveryStatus.SENT,
                sent_at=datetime.now(timezone.utc),
            )
            slip.sent_at = datetime.now(timezone.utc)
            db.add(delivery)
            deliveries.append(delivery)

            # In-app notification for employee
            if emp and emp.user_id:
                from app.features.notifications.service import NotificationService
                await NotificationService.create_notification(
                    db=db,
                    recipient_id=emp.user_id,
                    title="Your payslip is ready",
                    message=f"Your payslip for period {slip.period_start} to {slip.period_end} is now available.",
                    type="PAYSLIP_READY",
                    severity="INFO",
                    link=f"/payroll/payslips/{slip.id}",
                    organization_id=slip.organization_id,
                )


        except Exception as exc:
            logger.error(f"Failed sending payslip {slip.payslip_number} to {recipient_email}: {exc}")
            delivery = PayslipDelivery(
                organization_id=slip.organization_id,
                payslip_id=slip.id,
                recipient_email=recipient_email,
                delivery_type="EMAIL",
                status=DeliveryStatus.FAILED,
                failure_reason=str(exc),
            )
            db.add(delivery)
            deliveries.append(delivery)

    await db.commit()
    return deliveries
