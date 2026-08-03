FROM node:22-alpine AS deps

WORKDIR /app
ENV NEXT_TELEMETRY_DISABLED=1
ENV PNPM_HOME=/pnpm
ENV PATH=$PNPM_HOME:$PATH

RUN corepack enable && corepack prepare pnpm@11.6.0 --activate
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
RUN mkdir -p scripts
COPY scripts/ensure-pnpm.js ./scripts/ensure-pnpm.js
RUN pnpm install --frozen-lockfile

FROM node:22-alpine AS builder

WORKDIR /app
ENV NEXT_TELEMETRY_DISABLED=1
ENV PNPM_HOME=/pnpm
ENV PATH=$PNPM_HOME:$PATH

RUN corepack enable && corepack prepare pnpm@11.6.0 --activate
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN pnpm build

FROM node:22-alpine AS runner

WORKDIR /app
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV PNPM_HOME=/pnpm
ENV PATH=$PNPM_HOME:$PATH

RUN corepack enable && corepack prepare pnpm@11.6.0 --activate
COPY --from=builder /app ./

EXPOSE 3004
CMD ["pnpm", "start"]
