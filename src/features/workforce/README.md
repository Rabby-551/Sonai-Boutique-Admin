# Workforce and Payroll

Workforce owns attendance, leave, effective-dated salary records, and payroll snapshots. Payroll uses integer poisha, snapshots working days and attendance, and follows `draft → submitted → approved → paid`. Approval/payment commands are idempotent and audited.

No real bank details, payment credentials, NID values, or tax identifiers belong in this feature. Branch and self-service scope is enforced inside repositories as well as queries.

API-TODO: confirm attendance hardware, leave policy, overtime, tax and statutory deductions, accounting journals, payment provider, payslip delivery, employee privacy, and retention.
