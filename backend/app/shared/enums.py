from enum import Enum


class UserRole(str, Enum):
    EMPLOYEE = "EMPLOYEE"
    HR_MANAGER = "HR_MANAGER"
    HR_PAYROLL_USER = "HR_PAYROLL_USER"
    HR_PAYROLL_MANAGER = "HR_PAYROLL_MANAGER"
    ADMIN = "ADMIN"


class UserStatus(str, Enum):
    ACTIVE = "ACTIVE"
    INACTIVE = "INACTIVE"
    SUSPENDED = "SUSPENDED"


class OrganizationStatus(str, Enum):
    ACTIVE = "ACTIVE"
    SUSPENDED = "SUSPENDED"


class EmploymentType(str, Enum):
    FULL_TIME = "FULL_TIME"
    PART_TIME = "PART_TIME"
    CONTRACT = "CONTRACT"
    INTERN = "INTERN"


class EmployeeStatus(str, Enum):
    ACTIVE = "ACTIVE"
    INACTIVE = "INACTIVE"
    ON_LEAVE = "ON_LEAVE"
    TERMINATED = "TERMINATED"
    PROBATION = "PROBATION"
    SUSPENDED = "SUSPENDED"


class Gender(str, Enum):
    MALE = "MALE"
    FEMALE = "FEMALE"
    OTHER = "OTHER"
    NOT_SPECIFIED = "NOT_SPECIFIED"


class MaritalStatus(str, Enum):
    SINGLE = "SINGLE"
    MARRIED = "MARRIED"
    DIVORCED = "DIVORCED"
    WIDOWED = "WIDOWED"


class BankAccountType(str, Enum):
    SAVINGS = "SAVINGS"
    CURRENT = "CURRENT"
    SALARY = "SALARY"


class DocumentType(str, Enum):
    RESUME = "RESUME"
    ID_PROOF = "ID_PROOF"
    ADDRESS_PROOF = "ADDRESS_PROOF"
    OFFER_LETTER = "OFFER_LETTER"
    EXPERIENCE_LETTER = "EXPERIENCE_LETTER"
    TAX_FORM = "TAX_FORM"
    OTHER = "OTHER"


class SalaryRuleCategory(str, Enum):
    BASIC = "BASIC"
    ALLOWANCE = "ALLOWANCE"
    GROSS = "GROSS"
    DEDUCTION = "DEDUCTION"
    NET = "NET"


class CalculationType(str, Enum):
    FIXED = "FIXED"
    PERCENTAGE = "PERCENTAGE"
    FORMULA = "FORMULA"


class SalaryComponentValueType(str, Enum):
    FIXED = "FIXED"
    PERCENTAGE = "PERCENTAGE"


class ContractType(str, Enum):
    PERMANENT = "PERMANENT"
    FIXED_TERM = "FIXED_TERM"
    PROBATION = "PROBATION"
    CONTRACTOR = "CONTRACTOR"


class WageType(str, Enum):
    MONTHLY = "MONTHLY"
    DAILY = "DAILY"
    HOURLY = "HOURLY"


class ContractStatus(str, Enum):
    DRAFT = "DRAFT"
    ACTIVE = "ACTIVE"
    EXPIRED = "EXPIRED"
    TERMINATED = "TERMINATED"


class AttendanceStatus(str, Enum):
    PRESENT = "PRESENT"
    LATE = "LATE"
    HALF_DAY = "HALF_DAY"
    ABSENT = "ABSENT"
    HOLIDAY = "HOLIDAY"


class AttendanceSource(str, Enum):
    SELF = "SELF"
    MANUAL = "MANUAL"
    SYSTEM = "SYSTEM"


class CorrectionStatus(str, Enum):
    PENDING = "PENDING"
    APPROVED = "APPROVED"
    REJECTED = "REJECTED"


class HolidayType(str, Enum):
    PUBLIC = "PUBLIC"
    OPTIONAL = "OPTIONAL"
    COMPANY = "COMPANY"


class LeaveRequestStatus(str, Enum):
    PENDING = "PENDING"
    APPROVED = "APPROVED"
    REJECTED = "REJECTED"


LeaveStatus = LeaveRequestStatus


class PayrunStatus(str, Enum):
    DRAFT = "DRAFT"
    PROCESSING = "PROCESSING"
    PROCESSED = "PROCESSED"
    FINALIZED = "FINALIZED"


class PayrunEmployeeStatus(str, Enum):
    PENDING = "PENDING"
    COMPUTED = "COMPUTED"
    ISSUE = "ISSUE"


class PayrollIssueSeverity(str, Enum):
    INFO = "INFO"
    WARNING = "WARNING"
    ERROR = "ERROR"


class PayrollIssueStatus(str, Enum):
    OPEN = "OPEN"
    RESOLVED = "RESOLVED"
    IGNORED = "IGNORED"


class PayslipStatus(str, Enum):
    GENERATED = "GENERATED"
    PAID = "PAID"


class DeliveryStatus(str, Enum):
    PENDING = "PENDING"
    SENT = "SENT"
    FAILED = "FAILED"




