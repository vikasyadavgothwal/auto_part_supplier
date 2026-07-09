<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

<!-- BEGIN:autoparts-pro-codex-docs -->

## AutoParts Pro App Scope

App: `supplier_dashboard`  
Role: Supplier dashboard

### Responsibility

Supplier-facing dashboard for inventory, offers, orders, RFQ inbox, performance, settings, and supplier auth.

### Important Folders and Files

- app/(dashboard)/inventory, offers, orders, performance, rfq-inbox, settings
- app/api/auth and app/api/supplier
- `components/inventory, components/rfq-inbox, components/auth`
- `lib/auth, lib/supplier-parts-api.ts, lib/routes.ts`
- `scripts/ensure-pnpm.js`

### Connected Apps and Services

- auto_parts_admin/backend APIs through ADMIN_API_BASE_URL, BACKEND_URL, or NEXT_PUBLIC_ADMIN_API_BASE_URL
- Firebase web authentication
- Supplier catalog, RFQ, order, and inventory APIs

### Rules for Working Here

- Read the project root `AGENTS.md` and `docs/` files before cross-app work.
- Keep changes inside `supplier_dashboard` unless the task explicitly requires another app.
- Do not change API contracts, Prisma schema, auth cookies/JWTs, Firebase config, route base paths, or shared env behavior without listing affected apps first.
- Do not mix public website, admin, user, supplier, garage, and fleet business logic unless existing imports or APIs already connect them.
- Preserve existing Next.js version guidance and local architecture rules.

### What Not to Touch Unless Explicitly Required

- Other app folders.
- Package manager files and lockfiles.
- `.env` files and secrets.
- Generated folders such as `.next` and `node_modules`.
- Backend/API or Prisma code outside this app's scope.

### Check After Changes

- Inventory, RFQ inbox, offers, orders, and settings pages render
- Auth cookies are set/cleared through backend login/logout/refresh routes
- Backend URL points to the admin API server, not the supplier frontend
- Run the commands documented in this app README when relevant.
- Update project root `docs/AI_HANDOFF.md` after major changes.

<!-- END:autoparts-pro-codex-docs -->
