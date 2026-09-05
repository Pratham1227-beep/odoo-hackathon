import io
import os
from decimal import Decimal
from typing import Optional
from reportlab.lib import colors
from reportlab.lib.pagesizes import letter
from reportlab.lib.styles import ParagraphStyle, getSampleStyleSheet
from reportlab.lib.units import inch
from reportlab.platypus import HRFlowable, Paragraph, SimpleDocTemplate, Spacer, Table, TableStyle

from app.features.payroll.models import Payslip


def generate_payslip_pdf(payslip: Payslip, storage_dir: Optional[str] = None) -> tuple[str, bytes]:
    """Generate professional PDF payslip and save to local disk or return bytes."""
    buffer = io.BytesIO()
    doc = SimpleDocTemplate(
        buffer,
        pagesize=letter,
        rightMargin=36,
        leftMargin=36,
        topMargin=36,
        bottomMargin=36,
    )

    styles = getSampleStyleSheet()
    title_style = ParagraphStyle(
        "PayslipTitle",
        parent=styles["Heading1"],
        fontSize=18,
        leading=22,
        textColor=colors.HexColor("#1e293b"),
        alignment=1,  # Center
    )
    subtitle_style = ParagraphStyle(
        "PayslipSubtitle",
        parent=styles["Normal"],
        fontSize=10,
        leading=14,
        textColor=colors.HexColor("#64748b"),
        alignment=1,
    )
    section_style = ParagraphStyle(
        "SectionHeading",
        parent=styles["Heading3"],
        fontSize=12,
        leading=16,
        textColor=colors.HexColor("#0f172a"),
    )
    normal_style = styles["Normal"]
    bold_style = ParagraphStyle("BoldNormal", parent=styles["Normal"], fontName="Helvetica-Bold")

    story = []

    # Title & Header
    org_name = getattr(getattr(payslip, "employee", None), "organization", None)
    org_title = org_name.name if org_name else "PeoplePay360"
    story.append(Paragraph(org_title.upper(), title_style))
    story.append(Paragraph(f"Payslip for the period {payslip.period_start} to {payslip.period_end}", subtitle_style))
    story.append(Paragraph(f"Payslip No: {payslip.payslip_number} | Status: {payslip.status.value}", subtitle_style))
    story.append(Spacer(1, 15))
    story.append(HRFlowable(width="100%", thickness=1, color=colors.HexColor("#cbd5e1"), spaceAfter=15))

    # Employee Information Table
    emp = payslip.employee
    emp_name = f"{emp.first_name} {emp.last_name}" if emp else "N/A"
    emp_code = emp.employee_code if emp else "N/A"
    emp_email = emp.email if emp else "N/A"
    emp_dept = emp.department.name if emp and emp.department else "N/A"
    emp_desig = emp.designation.title if emp and emp.designation else "N/A"
    emp_pan = emp.pan_number if emp and emp.pan_number else "N/A"

    emp_info_data = [
        [Paragraph("<b>Employee Name:</b>", normal_style), Paragraph(emp_name, normal_style), Paragraph("<b>Department:</b>", normal_style), Paragraph(emp_dept, normal_style)],
        [Paragraph("<b>Employee Code:</b>", normal_style), Paragraph(emp_code, normal_style), Paragraph("<b>Designation:</b>", normal_style), Paragraph(emp_desig, normal_style)],
        [Paragraph("<b>Email:</b>", normal_style), Paragraph(emp_email, normal_style), Paragraph("<b>PAN Number:</b>", normal_style), Paragraph(emp_pan, normal_style)],
    ]

    emp_table = Table(emp_info_data, colWidths=[1.3 * inch, 2.2 * inch, 1.3 * inch, 2.2 * inch])
    emp_table.setStyle(TableStyle([
        ("VALIGN", (0, 0), (-1, -1), "TOP"),
        ("TOPPADDING", (0, 0), (-1, -1), 3),
        ("BOTTOMPADDING", (0, 0), (-1, -1), 3),
        ("BACKGROUND", (0, 0), (-1, -1), colors.HexColor("#f8fafc")),
        ("BOX", (0, 0), (-1, -1), 0.5, colors.HexColor("#e2e8f0")),
        ("INNERGRID", (0, 0), (-1, -1), 0.5, colors.HexColor("#e2e8f0")),
    ]))
    story.append(emp_table)
    story.append(Spacer(1, 15))

    # Earnings & Deductions Breakdown
    story.append(Paragraph("Salary & Deductions Breakdown", section_style))
    story.append(Spacer(1, 6))

    lines = sorted(payslip.lines or [], key=lambda x: x.sequence)
    table_data = [
        [
            Paragraph("<b>Code</b>", bold_style),
            Paragraph("<b>Component Name</b>", bold_style),
            Paragraph("<b>Category</b>", bold_style),
            Paragraph("<b>Rate / %</b>", bold_style),
            Paragraph("<b>Amount (INR)</b>", bold_style),
        ]
    ]

    for line in lines:
        rate_str = f"{line.rate}%" if line.rate is not None else "-"
        table_data.append([
            Paragraph(line.code, normal_style),
            Paragraph(line.name, normal_style),
            Paragraph(line.category, normal_style),
            Paragraph(rate_str, normal_style),
            Paragraph(f"{Decimal(str(line.amount)):,.2f}", normal_style),
        ])

    lines_table = Table(table_data, colWidths=[1.0 * inch, 2.6 * inch, 1.4 * inch, 1.0 * inch, 1.0 * inch])
    lines_table.setStyle(TableStyle([
        ("BACKGROUND", (0, 0), (-1, 0), colors.HexColor("#f1f5f9")),
        ("ALIGN", (3, 0), (-1, -1), "RIGHT"),
        ("VALIGN", (0, 0), (-1, -1), "MIDDLE"),
        ("GRID", (0, 0), (-1, -1), 0.5, colors.HexColor("#cbd5e1")),
        ("TOPPADDING", (0, 0), (-1, -1), 4),
        ("BOTTOMPADDING", (0, 0), (-1, -1), 4),
    ]))
    story.append(lines_table)
    story.append(Spacer(1, 15))

    # Net Salary Summary Box
    summary_data = [
        [Paragraph("<b>Gross Earnings:</b>", normal_style), Paragraph(f"INR {Decimal(str(payslip.gross_salary)):,.2f}", normal_style)],
        [Paragraph("<b>Total Deductions:</b>", normal_style), Paragraph(f"INR {Decimal(str(payslip.total_deductions)):,.2f}", normal_style)],
        [Paragraph("<b>Net Payable Salary:</b>", bold_style), Paragraph(f"<b>INR {Decimal(str(payslip.net_salary)):,.2f}</b>", bold_style)],
    ]
    summary_table = Table(summary_data, colWidths=[2.5 * inch, 2.0 * inch])
    summary_table.setStyle(TableStyle([
        ("BACKGROUND", (0, 0), (-1, -1), colors.HexColor("#f8fafc")),
        ("BACKGROUND", (0, 2), (-1, 2), colors.HexColor("#e2e8f0")),
        ("BOX", (0, 0), (-1, -1), 1, colors.HexColor("#94a3b8")),
        ("ALIGN", (1, 0), (1, -1), "RIGHT"),
        ("TOPPADDING", (0, 0), (-1, -1), 4),
        ("BOTTOMPADDING", (0, 0), (-1, -1), 4),
    ]))
    story.append(summary_table)

    story.append(Spacer(1, 25))
    story.append(Paragraph("This is a computer-generated payslip and does not require a physical signature.", subtitle_style))

    doc.build(story)
    pdf_bytes = buffer.getvalue()
    buffer.close()

    # Save to disk
    if storage_dir is None:
        storage_dir = os.path.join(os.getcwd(), "uploads", "payslips", str(payslip.organization_id))
    os.makedirs(storage_dir, exist_ok=True)
    file_path = os.path.join(storage_dir, f"{payslip.payslip_number}.pdf")
    with open(file_path, "wb") as f:
        f.write(pdf_bytes)

    return file_path, pdf_bytes
