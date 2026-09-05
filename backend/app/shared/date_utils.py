from datetime import date, timedelta
from decimal import Decimal
from typing import Any, Iterable, Optional, Set


def get_employee_working_days(employee: Optional[Any]) -> Set[int]:
    """Extract set of working weekdays (0=Monday, ..., 6=Sunday) for an employee.
    Defaults to {0, 1, 2, 3, 4} (Mon-Fri) if no specific schedule is found.
    """
    if employee is None:
        return {0, 1, 2, 3, 4}

    schedule = getattr(employee, "working_schedule", None) or getattr(employee, "schedule", None)
    working_days_raw = None
    if schedule is not None:
        working_days_raw = getattr(schedule, "working_days", None)
    if working_days_raw is None:
        working_days_raw = getattr(employee, "working_days", None)

    if working_days_raw is not None:
        result: Set[int] = set()
        day_map = {
            "mon": 0, "monday": 0,
            "tue": 1, "tuesday": 1,
            "wed": 2, "wednesday": 2,
            "thu": 3, "thursday": 3,
            "fri": 4, "friday": 4,
            "sat": 5, "saturday": 5,
            "sun": 6, "sunday": 6,
        }
        for item in working_days_raw:
            if isinstance(item, int):
                result.add(item)
            elif isinstance(item, str):
                normalized = item.strip().lower()
                if normalized in day_map:
                    result.add(day_map[normalized])
                elif normalized.isdigit():
                    result.add(int(normalized))
        if result:
            return result

    return {0, 1, 2, 3, 4}


def calculate_working_days(
    start_date: date,
    end_date: date,
    employee: Optional[Any] = None,
    holiday_dates: Optional[Iterable[date]] = None,
    working_weekdays: Optional[Set[int]] = None,
) -> Decimal:
    """Calculate working days between start_date and end_date (inclusive).
    Excludes non-working days (from working_weekdays or employee schedule)
    and holidays (regardless of is_paid).
    """
    if start_date > end_date:
        return Decimal("0.0")

    if working_weekdays is None:
        working_weekdays = get_employee_working_days(employee)

    holidays_set: Set[date] = set(holiday_dates) if holiday_dates else set()

    total_days = Decimal("0.0")
    curr = start_date
    while curr <= end_date:
        if curr.weekday() in working_weekdays and curr not in holidays_set:
            total_days += Decimal("1.0")
        curr += timedelta(days=1)

    return total_days
