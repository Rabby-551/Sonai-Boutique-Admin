# Administration

Administration owns staff profiles, mock user accounts, persisted role profiles, append-only audit events, and global business settings. The Owner role cannot be weakened. Password reset actions record fictional metadata only and never store credentials or reset tokens.

`requirePermission` reads persisted schema-v4 role profiles at the server boundary. The synchronous `can` helper is for initial navigation and presentation only.

API-TODO: confirm identity provider, MFA, password reset delivery, session revocation, employee data retention, immutable audit storage, settings ownership, and production secrets management.
