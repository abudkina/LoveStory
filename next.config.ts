import type { NextConfig } from "next";

const basePath = process.env.GITHUB_PAGES === "true" ? "/LoveStory" : "";

const nextConfig: NextConfig = {
  ...(process.env.GITHUB_PAGES === "true" ? { output: "export" as const } : {}),
  basePath,
  assetPrefix: basePath ? `${basePath}/` : undefined,
  images: { unoptimized: true },
  trailingSlash: false,
  devIndicators: false,
  env: {
    NEXT_PUBLIC_BASE_PATH: basePath,
    NEXT_PUBLIC_APP_URL:
      process.env.NEXT_PUBLIC_APP_URL ??
      (process.env.GITHUB_PAGES === "true" ? "https://abudkina.github.io/LoveStory" : ""),
  },
};

export default nextConfig;
