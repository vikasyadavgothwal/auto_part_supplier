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
```

Use the same Firebase web application values as `auto-parts-pro-user`. If the
Firebase values are omitted, login falls back to backend-managed email and
password accounts.

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
