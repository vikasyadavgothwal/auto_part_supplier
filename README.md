This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, install dependencies:

```bash
pnpm install
```

Then run the development server:

```bash
pnpm dev
```

Build and start the production server with:

```bash
pnpm build
pnpm start
```

This project is pnpm-only. `npm`, `yarn`, and `bun` are blocked by lifecycle guards in `package.json`.

Open [http://localhost:3004](http://localhost:3004) with your browser during
local development.

In production, `pnpm start` listens on port `3004`. If Next.js prints a network
URL like `http://0.0.0.0:3004`, that is only the bind address. Open the app with
your server's public IP instead:

```text
http://13.62.243.148:3004/orders
```

## Authentication configuration

The dashboard exchanges a Firebase ID token for backend access and refresh
tokens. The backend tokens remain in HttpOnly cookies and are never stored in
browser storage.

Configure these values for the dashboard runtime. `ADMIN_API_BASE_URL` is
required; the app does not fall back to a hardcoded localhost backend.

```bash
ADMIN_API_BASE_URL=http://13.62.243.148:3000
NEXT_PUBLIC_FIREBASE_API_KEY=
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=
NEXT_PUBLIC_FIREBASE_PROJECT_ID=
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=
NEXT_PUBLIC_FIREBASE_APP_ID=
NEXT_PUBLIC_FIREBASE_VAPID_KEY=
```

Use the same Firebase web application values as `auto-parts-pro-user`. If the
Firebase values are omitted, login falls back to backend-managed email and
password accounts.

Firebase push notifications require `NEXT_PUBLIC_FIREBASE_VAPID_KEY` plus the
Firebase web config above. The dashboard registers the browser token only after
login and browser notification permission.

`ADMIN_API_BASE_URL` must point to the backend API server, not the supplier
dashboard domain. For example, do not set it to
`http://supplier.websitedesignersdubai.ae`.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.

<!-- BEGIN:autoparts-pro-codex-docs -->

## AutoParts Pro App Notes

### App Purpose

Supplier-facing dashboard for inventory, offers, orders, RFQ inbox, performance, settings, and supplier auth.

### Important Folders

- app/(dashboard)/inventory, offers, orders, performance, rfq-inbox, settings
- app/api/auth and app/api/supplier
- `components/inventory, components/rfq-inbox, components/auth`
- `lib/auth, lib/supplier-parts-api.ts, lib/routes.ts`
- `scripts/ensure-pnpm.js`

### Environment Variables

Detected or documented variables:

- `ADMIN_API_BASE_URL`
- `BACKEND_URL`
- `NEXT_PUBLIC_ADMIN_API_BASE_URL`
- `USER_ACCESS_COOKIE_NAME`
- `USER_REFRESH_COOKIE_NAME`
- `NEXT_PUBLIC_FIREBASE_API_KEY`
- `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN`
- `NEXT_PUBLIC_FIREBASE_PROJECT_ID`
- `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET`
- `NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID`
- `NEXT_PUBLIC_FIREBASE_APP_ID`
- `NEXT_PUBLIC_FIREBASE_VAPID_KEY`
- `NEXT_PUBLIC_BASE_PATH`

### Run, Build, and Test Commands

Install:

```bash
pnpm install
```

Detected scripts:

- `pnpm dev`
- `pnpm build`
- `pnpm start`
- `pnpm lint`
- `pnpm test`

Runtime note: dev/start use port 3004.

### Connected Apps and Services

- auto_parts_admin/backend APIs through ADMIN_API_BASE_URL, BACKEND_URL, or NEXT_PUBLIC_ADMIN_API_BASE_URL
- Firebase web authentication
- Supplier catalog, RFQ, order, and inventory APIs

### Common Checks Before Deployment

- Inventory, RFQ inbox, offers, orders, and settings pages render
- Auth cookies are set/cleared through backend login/logout/refresh routes
- Backend URL points to the admin API server, not the supplier frontend
- Run lint/build for this app before deployment.
- Re-check affected API, auth, database, and env contracts in connected apps.

<!-- END:autoparts-pro-codex-docs -->
