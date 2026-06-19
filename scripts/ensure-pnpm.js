const userAgent = process.env.npm_config_user_agent || "";

if (!userAgent.startsWith("pnpm/")) {
  console.error("This project is pnpm-only. Use `pnpm install`, `pnpm dev`, `pnpm build`, or `pnpm start`.");
  process.exit(1);
}
