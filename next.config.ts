import type { NextConfig } from "next";

const externalRedirect = {
  basePath: false as const,
  permanent: false,
};

const securityHeaders = [
  ...(process.env.NODE_ENV === "production"
    ? [
        {
          key: "Strict-Transport-Security",
          value: "max-age=31536000; includeSubDomains",
        },
      ]
    : []),
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "X-Frame-Options", value: "SAMEORIGIN" },
  {
    key: "Permissions-Policy",
    value: "camera=(), microphone=(), geolocation=(), payment=()",
  },
];

const nextConfig: NextConfig = {
  poweredByHeader: false,
  experimental: {
    proxyClientMaxBodySize: "12mb",
  },
  async headers() {
    return [{ source: "/:path*", headers: securityHeaders }];
  },
  async redirects() {
    return [
      {
        source: "/",
        destination: "/dashboard",
        ...externalRedirect,
      },
      {
        source: "/dahboard",
        destination: "/dashboard",
        ...externalRedirect,
      },
      {
        source: "/dahboard/:path*",
        destination: "/dashboard/:path*",
        ...externalRedirect,
      },
    ];
  },
};
export default nextConfig;
