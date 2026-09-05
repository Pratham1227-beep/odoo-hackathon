from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText
import logging
import smtplib
from app.core.config import settings

logger = logging.getLogger("mailer")


def send_email(to: str, subject: str, body: str) -> None:
    """Send transactional email using SMTP, or fallback to console logging in development."""
    if not settings.SMTP_HOST or not settings.SMTP_USER:
        # Development / test mode fallback
        logger.info(
            f"\n--- [DEV EMAIL DISPATCH] ---\n"
            f"To: {to}\n"
            f"From: {settings.SMTP_FROM_EMAIL}\n"
            f"Subject: {subject}\n"
            f"Body:\n{body}\n"
            f"----------------------------"
        )
        return

    try:
        msg = MIMEMultipart("alternative")
        msg["Subject"] = subject
        msg["From"] = settings.SMTP_FROM_EMAIL
        msg["To"] = to

        part = MIMEText(body, "html" if "<html" in body.lower() or "<div" in body.lower() or "<p" in body.lower() else "plain")
        msg.attach(part)

        with smtplib.SMTP(settings.SMTP_HOST, settings.SMTP_PORT) as server:
            server.ehlo()
            server.starttls()
            if settings.SMTP_USER and settings.SMTP_PASSWORD:
                server.login(settings.SMTP_USER, settings.SMTP_PASSWORD)
            server.sendmail(settings.SMTP_FROM_EMAIL, [to], msg.as_string())
        logger.info(f"Email sent successfully to {to}")
    except Exception as e:
        logger.error(f"Failed to send email to {to} via SMTP: {e}")
        # Log to console so flows don't break in dev
        logger.info(f"[FAILED SMTP FALLBACK] Body intended for {to}: {body}")
