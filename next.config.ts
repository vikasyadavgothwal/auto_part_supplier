import type { NextConfig } from "next";
const externalRedirect = {
  basePath: false as const,
  permanent: false,
};
const nextConfig: NextConfig = {
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
