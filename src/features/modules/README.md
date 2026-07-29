# Operational Modules

The module registry provides a consistent, readable MVP for all record-oriented admin areas. Each record crosses `ModuleRepository`, is parsed by `moduleListSchema`, and is then displayed by `ModulePage` and `ModuleTable`.

To deepen a module, create a dedicated feature folder with its own domain schema and repository rather than adding unrelated branching to the shared registry. Inventory, fulfillment, payroll, and reporting rules must remain separate because their transitions, permissions, and units differ.

`API-TODO`: replace the generic HTTP collection shape after the backend envelope and pagination contract are confirmed.
