Q# WageWise: Smart HR & Payroll Management System

**An Integrated Human Resource, Attendance, Leave & Payroll Operations Platform**

---

# 1. Problem Statement

Modern organizations, particularly startups and SMEs, often manage employee information, contracts, attendance, leave, salary structures, and payroll using disconnected systems, spreadsheets, or manual processes.
Employee information may exist in one system, attendance in another, leave requests through email or messaging applications, and payroll calculations in spreadsheets or isolated payroll tools.
This creates disconnected workflows where important employee and payroll information does not flow seamlessly from one operational process to another.
For example:

- Employee information is maintained separately from contracts.
- Employees may have multiple contracts over time.
- Working schedules determine expected working hours but may not be connected to attendance.
- Attendance records may contain missing check-outs or other exceptions.
- Leave balances depend on allocations and approved leave requests.
- Payroll must determine which contract applies to a specific payroll period.
- Salary calculations depend on configurable salary structures and salary rules.
- Payroll officers need to identify warnings and incomplete information before finalizing payroll.
- Employees need understandable payslips showing exactly how their salary was calculated.

## Core Issues

- Employee, contract, attendance, leave, and payroll information is not always connected.
- Historical employee contracts may not be properly considered during payroll processing.
- Attendance exceptions require manual review and correction.
- Working schedules are often disconnected from attendance expectations.
- Leave allocations and leave requests may not be synchronized.
- Salary calculations can become difficult when multiple earnings and deduction rules are involved.
- Payroll errors can occur because of incomplete employee information or duplicate payroll records.
- Employees have limited visibility into how their salary is calculated.
- Payroll teams spend significant time reviewing and reconciling information before payment.
- Management lacks a centralized view of payroll, attendance, leave, staffing, and salary costs.

## Employee Pain Points

- "How was my salary calculated?"
- "Why was this amount deducted from my salary?"
- "How many leave days do I have remaining?"
- "Has my leave request been approved?"
- "What attendance records were considered for my payroll?"
- "Where can I find my payslip?"

## HR Manager Pain Points

- Maintaining employee records manually.
- Managing historical employee contracts.
- Monitoring attendance and correcting exceptions.
- Managing working schedules.
- Managing leave types, allocations, and requests.
- Ensuring employee information remains accurate.
- Spending excessive time navigating disconnected HR records.

## Payroll User Pain Points

- Selecting the correct employees for payroll.
- Ensuring the correct contract applies to the payroll period.
- Reviewing attendance and leave information before payroll.
- Applying multiple salary rules correctly.
- Identifying incomplete information before finalization.
- Detecting duplicate payslips or payroll records.
- Handling payroll calculations manually.
- Responding to employee salary disputes.

## Payroll Manager Pain Points

- Maintaining salary structures and salary rules.
- Controlling the order in which salary rules are executed.
- Ensuring payroll calculations are consistent.
- Reviewing payroll warnings before finalization.
- Maintaining accurate historical payroll records.
- Monitoring payroll costs and trends.

## Admin Pain Points

- Managing users and permissions.
- Maintaining role-based access.
- Monitoring the entire HR and payroll operation.
- Ensuring users only access the modules appropriate to their responsibilities.

## Core Problem

The real problem is not simply managing employees, attendance, leave, or payroll individually.
The core problem is the **absence of a unified HR and payroll system where employee master data, contracts, working schedules, attendance, time off, salary configuration, payroll computation, payslips, and reporting are connected through one operational workflow.**
WageWise addresses this problem by connecting the complete employee-to-payslip lifecycle.

---

# 2. Solution Overview

**WageWise** is a role-based HR and Payroll Management System that centralizes employee information and connects it with contracts, working schedules, attendance, time off, salary configuration, payroll processing, payslips, and reporting.
The system transforms individual HR records into a connected operational flow:
**Employee → Contract → Working Schedule → Attendance / Time Off → Salary Structure & Rules → Payrun → Payslip → Payment / Delivery → Reports**
The system is designed around the principle:

> **"Every employee record contributes to an accurate payroll — from employment terms and working time to leave, salary rules, payslip generation, and final reporting."**

## Key Capabilities

### Unified Employee Management

- Central employee records.
- Employee profiles.
- Department and manager information.
- Job position.
- Employment status.
- Employee type.
- Related contracts, attendance, time off, and allocations.

### Contract Management

- Multiple historical contracts per employee.
- Contract validity periods.
- Wage information.
- Department and position.
- Salary structure assignment.
- Identification of the contract applicable to a payroll period.
- Prevention of inappropriate concurrent active contracts.

### Working Schedule Management

- Configurable weekly schedules.
- Day-wise working hours.
- Start and end times.
- Break periods.
- Automatic calculation of weekly hours.
- Employee or contract schedule assignment.

### Attendance Management

- Check-in and check-out.
- Worked hours.
- Attendance status.
- Attendance exceptions.
- Missing check-outs.
- Authorized attendance corrections.
- Attendance reporting.

### Time Off Management

- Configurable time-off types.
- Paid and unpaid leave policies.
- Day/hour-based leave.
- Leave allocations.
- Leave balances.
- Leave requests.
- Approval/refusal workflow.
- Automatic balance consumption for applicable approved requests.
- Payroll integration.

### Configurable Payroll

- Salary structures.
- Salary rules.
- Salary rule categories.
- Rule sequencing.
- Fixed amount calculations.
- Percentage-based calculations.
- Formula-based calculations.
- Earnings.
- Allowances.
- Deductions.
- Gross salary.
- Net salary.

### Payrun Processing

- Payroll period selection.
- Salary structure selection.
- Employee selection.
- Payrun creation wizard.
- Payslip generation.
- Payroll computation.
- Validation.
- Warnings.
- Payment status.
- Historical payroll records.

### Payslip Management

- Detailed salary breakdown.
- Basic salary.
- Allowances.
- Gross salary.
- Deductions.
- Net salary.
- Worked days.
- PDF generation.
- Individual payslip printing.
- Bulk payslip email delivery.

### Payroll Dashboard

- Total net salary.
- Payslips generated.
- Average salary.
- Approved time off.
- Attendance health.
- Salary cost by department.
- Monthly salary trends.
- Payroll warnings.
- Attendance overview.
- Leave overview.
- Department-level payroll analysis.

# 3. Target Users / Personas

## 3.1 Employee

### Responsibilities

Employees use WageWise primarily to view their own information and perform operational activities.

### Needs

- View employee details.
- View attendance records.
- Check in and check out.
- Submit time-off requests.
- View leave balances.
- View payroll information.
- View and download payslips.

### Access Restrictions

Employees must not have access to:

- Payroll administration.
- Salary rule configuration.
- Salary structure configuration.
- Employee administration.
- User management.
- System configuration.

### Primary Pain Point

> "I want to clearly understand my attendance, leave balance, and salary."

## 3.2 HR Manager

### Responsibilities

The HR Manager manages employee and workforce operations.

### Needs

- Create and update employees.
- Manage employee records.
- Manage contracts.
- Manage working schedules.
- Manage attendance.
- Correct authorized attendance exceptions.
- Manage time-off types.
- Manage allocations.
- Review and approve/refuse time-off requests.

### Access Restrictions

The HR Manager does not have access to payroll processing features.

### Primary Pain Point

> "I need one place to manage employee operations instead of manually maintaining disconnected HR records."

## 3.3 HR Payroll User

### Responsibilities

The HR Payroll User handles operational payroll processing in addition to HR operations.

### Needs

- Access HR Manager functionality.
- Create payruns.
- Read and update payruns.
- Create and update payslips.
- Review salary calculations.
- Review payroll warnings.
- Validate payroll information.

### Restrictions

- Salary Structures are read-only.
- Salary Rules are read-only.
- Configuration of salary structures and rules remains controlled by the HR Payroll Manager.

### Primary Pain Point

> "I need payroll data to be generated from accurate HR information without manually rebuilding calculations."

## 3.4 HR Payroll Manager

### Responsibilities

The HR Payroll Manager controls payroll operations and payroll configuration.

### Needs

- All HR Payroll User permissions.
- Full payroll management.
- Create/update/delete Payruns.
- Create/update/delete Payslips.
- Manage Salary Structures.
- Manage Salary Rules.
- Control payroll configuration.
- Review payroll calculations.
- Maintain payroll history.

### Primary Pain Point

> "Payroll must follow consistent rules and remain accurate even when salary structures and employee conditions change."

## 3.5 Admin

### Responsibilities

The Admin controls the complete platform.

### Needs

- Full system access.
- User management.
- Role assignment.
- Permission management.
- System monitoring.
- Access to all HR and payroll modules.
- Overall system administration.

### Primary Pain Point

> "I need complete visibility and control over the system while maintaining proper access restrictions."

# 4. Core MVP Features

## 4.1 Authentication & Role Management

WageWise must provide secure user authentication and role-based authorization.

### Requirements

- Login system.
- Role-based access control.
- Employee role.
- HR Manager role.
- HR Payroll User role.
- HR Payroll Manager role.
- Admin role.
- Permission-based module access.

### Role Hierarchy

**Employee**
↓
**HR Manager**
↓
**HR Payroll User**
↓
**HR Payroll Manager**
↓
**Admin**
The hierarchy represents increasing access to HR, payroll, configuration, and administration capabilities.

# 4.2 Employee Management

Employee Management acts as the central HR hub.

### Employee Record

Each employee record should contain relevant information including:

- Employee identity.
- Job position.
- Department.
- Manager.
- Employee type.
- Working schedule.
- Employment status.

### Views

The system should support:

- Employee List View.
- Employee Kanban View.
- Employee Form View.

### Related Records

The Employee Form should provide direct access to:

- Contracts.
- Attendance.
- Time Off.
- Allocations.

The related-record actions should show record counts and open filtered records.

### Business Requirement

The employee record must act as the central navigation point for the employee's HR lifecycle.

# 4.3 Contract Management

WageWise must maintain employee contracts as historical records.

### Contract Information

A contract should capture:

- Employee.
- Contract start date.
- Contract end date.
- Department.
- Job position.
- Wage.
- Salary structure.
- Contract status.

### Business Rules

1. Employees may have multiple contracts over time.
2. Historical contracts must remain available.
3. Payroll must identify the contract applicable to the selected payroll period.
4. Payroll must not use an unrelated historical contract.
5. The system should prevent inappropriate concurrent active contracts.

### Key Requirement

**Period-based contract selection is a core payroll rule.**
For a selected payroll period, WageWise must use the contract applicable to that period when calculating the employee's payslip.

# 4.4 Working Schedule Management

Working Schedules define expected employee working patterns.

### Schedule Information

Each schedule should support:

- Schedule name.
- Schedule type.
- Day.
- Start time.
- End time.
- Break duration.
- Weekly working hours.

### Business Rules

- Weekly hours must be calculated automatically.
- Users should not need to manually enter the total weekly hours.
- Schedules can be assigned to employees or contracts.
- Attendance can be evaluated in relation to the assigned schedule.

### Example Structure

**Monday**
Start → End → Break
**Tuesday**
Start → End → Break
...
**Sunday**
Start → End → Break
The system calculates the total expected weekly hours from the defined schedule.

# 4.5 Attendance Management

Attendance records represent daily employee working activity.

### Attendance Data

Each attendance record should include:

- Employee.
- Check-in.
- Check-out.
- Worked hours.
- Status.
- Attendance exceptions.

### Attendance Status / Conditions

The system should support identification of conditions such as:

- Present.
- Late.
- Absent.
- Overtime.
- Missing check-out.
- Manually edited attendance.

### Attendance Correction

Authorized HR users must be able to correct attendance records.

### Business Rules

- Attendance records must remain available for reporting.
- Attendance data must contribute to payroll-related insights.
- Attendance exceptions should be visible before payroll processing.
- Missing check-outs should be identifiable as operational warnings.

# 4.6 Time Off Management

Time Off provides the complete leave lifecycle.

## Time-Off Types

The system should allow configuration of:

- Time-off name.
- Unit: days or hours.
- Allocation requirement.
- Approval workflow.
- Payroll integration behavior.

## Allocations

Allocations determine the amount of leave available to employees.
The system should track:

- Employee.
- Time-off type.
- Allocated amount.
- Taken amount.
- Remaining amount.
- Validity period.
- Allocation status.

### Allocation Rule

An allocation must be approved before it becomes available for use where approval is required.

## Time-Off Requests

Employees can submit requests containing:

- Employee.
- Time-off type.
- Dates.
- Duration.
- Request status.

### Request Lifecycle

**Draft / Requested → Approved / Refused**

### Business Rules

1. Approved requests requiring allocation reduce the employee's available balance.
2. Leave balances must reflect consumed approved leave.
3. Requests must remain linked to the employee and relevant time-off type.
4. Authorized HR users can approve or refuse requests.

# 4.7 Salary Structure Management

Salary Structures define groups of salary rules used during payroll calculation.

### Salary Structure

A structure acts as a container for salary rules.
Example:
**Regular Salary Structure**
→ Basic Salary Rule
→ Allowance Rule
→ Deduction Rule
→ Gross Salary Rule
→ Net Salary Rule

### Structure Information

- Name.
- Number of salary rules.
- Associated employees.
- Active status.
- Included salary rules.
- Rule execution sequence.

### Business Rule

The salary structure selected for a Payrun determines which salary rules are applied to the payslips generated in that Payrun.

# 4.8 Salary Rule Management

Salary Rules define individual payroll calculations.

### Salary Rule Information

Each rule should include:

- Name.
- Code.
- Category.
- Sequence.
- Computation method.

### Salary Rule Categories

The system should support categories including:

- Basic.
- Allowances.
- Gross.
- Deductions.
- Net Salary.

### Computation Methods

Salary rules may calculate amounts using:

1. Fixed amounts.
2. Percentages.
3. Formulas.

### Rule Sequence

Salary rules must execute in a defined sequence.
This ensures that calculations depending on earlier results use the correct values.

### Example

Basic Salary
↓
Allowance
↓
Gross Salary
↓
Deduction
↓
Net Salary
The final payslip should expose the resulting component-level calculations.

# 4.9 Payroll Management

Payroll is the core operational module of WageWise.
Payroll transforms employee HR information into validated payslips.

### Payroll Inputs

Payroll computation can depend on:

- Employee record.
- Applicable contract.
- Working schedule.
- Attendance.
- Time Off.
- Salary Structure.
- Salary Rules.
- Payroll period.

### Payroll Lifecycle

**Payrun Setup**
↓
**Employee Selection**
↓
**Payslip Generation**
↓
**Compute**
↓
**Review**
↓
**Validate**
↓
**Mark Paid**
↓
**Send Payslips**
↓
**Historical Record**

# 4.10 Payrun Creation Wizard

Payrun creation should use a two-step workflow.

## Step 1 — Payrun Setup

The user defines:

- Salary Structure.
- Payroll Period.

The system should not immediately create the Payrun.
The user selects **Continue** to proceed.

## Step 2 — Employee Selection

The system provides eligible employees.
Users can filter and explicitly select employees to include in the payroll.

### Create Payrun

After selecting employees, the user selects **Create Payrun**.
The system then:

- Creates the Payrun.
- Includes only selected employees.
- Generates the relevant payroll records.
- Opens the processing view.

# 4.11 Payrun Processing

Each Payrun represents payroll for a defined period.

### Payrun Information

- Payrun name.
- Salary structure.
- Payroll period.
- Status.
- Selected employees.
- Generated payslips.
- Payroll summary.

### Processing Actions

Authorized payroll users should be able to:

- Compute.
- Validate.
- Mark Paid.
- Send Payslips.

### Payroll Warnings

The system should surface potential issues before finalization.
Examples include:

- Missing required employee information.
- Missing bank details.
- Duplicate payslips.
- Contract-related attention items.

### Historical Records

Finalized or paid Payruns must remain available as historical payroll records.

# 4.12 Payslip Management

Payslips represent the employee-level result of payroll computation.

### Payslip Information

Each payslip should contain:

- Employee.
- Salary Structure.
- Payrun.
- Payroll period.
- Status.
- Worked days.

### Salary Computation

The payslip must show a transparent breakdown of:

- Basic.
- Allowances.
- Gross.
- Deductions.
- Net Salary.

### Computation Source

The payslip calculation must use:

- The contract applicable to the payroll period.
- The Salary Structure assigned to the Payrun.
- The Salary Rules contained in that structure.

# 4.13 Payslip PDF & Employee Delivery

WageWise must allow employees and authorized payroll users to access payslips.

### PDF Generation

The system must provide a **Print Payslip** action that generates a printable PDF.

### Bulk Delivery

The Payrun should provide a **Send Payslips** action for bulk email distribution.

### Requirement

The same payslip data shown within WageWise must be represented in the generated PDF.

# 4.14 Payroll Dashboard & Analytics

The Payroll Dashboard provides centralized visibility across HR and payroll.
The dashboard should combine data from:

- Employees.
- Contracts.
- Attendance.
- Time Off.
- Payroll.

## KPI Cards

The dashboard should display metrics such as:

- Total Net Salary Paid.
- Payslips Generated.
- Average Salary.
- Approved Time Off.
- Attendance Health.

## Payroll Analytics

The dashboard should provide:

- Salary Cost by Department.
- Monthly Net Salary Trends.
- Payroll status.
- Payroll warnings.

## Attendance Overview

The dashboard should provide insight into:

- Present employees.
- Late employees.
- Absent employees.
- Overtime.
- Missing check-outs.
- Manual attendance edits.
- Attendance coverage.

## Time-Off Overview

The dashboard should show:

- Approved days.
- Pending requests.
- Leave balances.
- Leave patterns.

## Department Analysis

The system should combine:

- Department headcount.
- Total salary expenditure.

## Filters

Dashboard data should be filterable by:

- Period.
- Department.
- Employee Type.

### Critical Requirement

Dashboard information must be generated from **live system records**, not static or hardcoded charts.

# 5. User Flow & Journey

## 5.1 Employee Flow

1. Login.
2. Open Employee Dashboard.
3. View employee information.
4. Check in.
5. Check out.
6. View attendance records.
7. View leave balance.
8. Create Time-Off Request.
9. Track request status.
10. View payroll information.
11. View payslip.
12. Download/print payslip.

### Employee Journey

**Employee → Attendance → Time Off → Payroll → Payslip**

# 5.2 HR Manager Flow

1. Login.
2. Open Employee Management.
3. Create/update employee records.
4. Manage employee contracts.
5. Configure/assign working schedules.
6. Monitor attendance.
7. Review attendance exceptions.
8. Correct authorized attendance records.
9. Manage Time-Off Types.
10. Manage Allocations.
11. Review Time-Off Requests.
12. Approve/refuse requests.
13. Monitor HR information.

### HR Journey

**Employee → Contract → Schedule → Attendance → Time Off**

# 5.3 HR Payroll User Flow

1. Login.
2. Review employee information.
3. Review contracts.
4. Review attendance.
5. Review Time Off.
6. Create Payrun.
7. Select Salary Structure.
8. Select payroll period.
9. Select eligible employees.
10. Create Payrun.
11. Compute payroll.
12. Review payslips.
13. Review warnings.
14. Update permitted payroll information.
15. Validate Payrun.
16. Mark Payrun as Paid.
17. Send Payslips.

### Payroll Journey

**HR Data → Payrun → Compute → Validate → Paid → Payslip Delivery**

# 5.4 HR Payroll Manager Flow

1. Login.
2. Review payroll operations.
3. Configure Salary Structures.
4. Configure Salary Rules.
5. Define salary rule sequences.
6. Review HR and payroll information.
7. Create/manage Payruns.
8. Review salary computations.
9. Validate payroll.
10. Mark payroll as Paid.
11. Generate Payslips.
12. Send Payslips.
13. Review payroll history.
14. Monitor Payroll Dashboard.

---

# 5.5 Admin Flow

1. Login.
2. Open System Overview.
3. Manage users.
4. Assign roles.
5. Update permissions.
6. Monitor HR operations.
7. Monitor payroll operations.
8. Access all modules.
9. Maintain system administration.

# 6. System Behavior & Business Rules

## 6.1 Employee-Centric Data Model

The Employee record acts as the central hub.
Related information includes:
**Employee**
→ Contracts
→ Working Schedule
→ Attendance
→ Time Off
→ Allocations
→ Payroll
→ Payslips

## 6.2 Contract Rule

Employees may have historical contracts.
Payroll must select the contract applicable to the selected payroll period.
Historical contracts must remain available for record keeping.

## 6.3 Working Schedule Rule

Working schedules define expected working patterns.
Weekly working hours must be calculated automatically from:
**Daily Working Hours − Breaks**
across the defined weekly schedule.

## 6.4 Attendance Rule

Attendance records capture employee working activity.
Authorized users may correct attendance records.
Attendance exceptions must be visible to HR/payroll users.

## 6.5 Time-Off Rule

Time-Off Requests must pass through the configured approval process.
Where allocation is required:
**Approved Time Off → Allocation Consumption → Updated Leave Balance**

## 6.6 Salary Rule Execution

Salary Rules must be executed according to their sequence.
This ensures that dependent calculations use previously calculated values.

## 6.7 Payroll Rule

A Payrun uses:
**Selected Payroll Period + Applicable Contract + Selected Salary Structure + Salary Rules + Relevant HR Data**
to generate payslips.

## 6.8 Payroll Validation Rule

Potential payroll problems must be surfaced before finalization.
Examples:

- Duplicate payslips.
- Missing required information.
- Missing bank details.
- Contract attention items.

## 6.9 Payrun Lifecycle

**New**
↓
**Computed**
↓
**Validated**
↓
**Paid**
↓
**Historical**

## 6.10 Payslip Rule

Each payslip must preserve the salary computation used for that payroll period.
It must display a transparent component-level breakdown.

# 7. Data Relationships

The core relationship model of WageWise is:
**Employee**
↓
**Contract**
↓
**Salary Structure**
↓
**Salary Rules**
↓
**Payrun**
↓
**Payslip**
At the same time:
**Employee**
↓
**Working Schedule**
↓
**Attendance**
and
**Employee**
↓
**Time-Off Allocation**
↓
**Time-Off Request**
These streams converge during payroll processing.

### Overall Business Flow

**Employee Master Data**
↓
**Contract + Schedule**
↓
**Attendance + Time Off**
↓
**Salary Structure + Salary Rules**
↓
**Payrun**
↓
**Payslip**
↓
**Payment / Delivery**
↓
**Payroll Dashboard & Historical Records**

# 8. Success Metrics

WageWise should be considered successful when it achieves the following outcomes:

## Operational Efficiency

- Reduced manual HR administration.
- Reduced repetitive payroll calculations.
- Faster payroll preparation.
- Faster employee record management.

## Payroll Accuracy

- Correct period-based contract selection.
- Accurate salary rule execution.
- Accurate leave-related information.
- Reduced payroll calculation errors.
- Early detection of payroll warnings.

## Employee Transparency

- Employees can view attendance.
- Employees can view leave balances.
- Employees can understand salary components.
- Employees can access payslips.

## HR Efficiency

- Centralized employee records.
- Connected contracts and schedules.
- Easier attendance correction.
- Easier leave management.

## Management Visibility

- Live payroll dashboard.
- Department-level salary analysis.
- Attendance insights.
- Leave insights.
- Payroll warning visibility.
- Historical payroll information.

# 9. Constraints

The MVP will prioritize the complete core HR-to-payroll workflow over advanced enterprise functionality.

### Constraints

- Focus on core HR and payroll operations.
- Payroll logic should be configurable but remain within the defined MVP scope.
- Complex country-specific payroll regulations are outside the core MVP unless specifically implemented.
- Full biometric hardware integration is not required in the initial version.
- Advanced mobile applications are outside the initial MVP.
- Highly advanced anomaly detection is outside the initial MVP.
- The system should prioritize functional business logic and data relationships over excessive UI complexity.

# 10. Non-Functional Requirements

## Performance

- Common HR screens should load efficiently.
- Payroll calculations should complete within a reasonable operational time.
- Dashboard data should reflect current system records.

## Security

- Authentication must be required for protected functionality.
- Role-based permissions must restrict access to sensitive HR and payroll data.
- Payroll configuration must only be accessible to authorized roles.
- Employee users must only access their own permitted information.

## Reliability

- Payroll records must remain available after finalization.
- Historical Payruns must not be lost.
- Payslip information must remain consistent with the finalized payroll.

## Usability

- Employee records should provide clear navigation to related records.
- Payroll processing should follow a guided workflow.
- Salary calculations should be understandable.
- Warnings should be clearly visible before payroll finalization.

## Maintainability

- Salary calculations should be driven by configurable rules rather than hardcoded salary values.
- HR and payroll modules should maintain clear relationships.
- Business logic should remain separated from presentation where possible.