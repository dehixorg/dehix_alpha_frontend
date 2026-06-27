---
name: Use Shadcn UI or Shared Components Only
description: Enforce using Shadcn UI or existing shared components on frontend pages to maintain code consistency.
---

# Use Shadcn UI or Shared Components Only

When adding new UI elements, components, or making UI/content modifications:
- ALWAYS check if a matching component exists under `src/components/ui/` or `src/components/shared/`.
- Prefer existing Shadcn UI primitives (e.g., `toast`, `button`, `card`, etc.) to keep the codebase consistent.
- Do not introduce non-standard styling libraries or custom UI utilities unless absolutely necessary.
- Ensure styling and layouts remain consistent with the existing application design system.
