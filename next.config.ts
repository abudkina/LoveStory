import type { NextConfig } from "next";

const basePath = process.env.GITHUB_PAGES === "true" ? "/LoveStory" : "";

const nextConfig: NextConfig = {
  output: "export",
  basePath,
  assetPrefix: basePath ? `${basePath}/` : undefined,
  images: { unoptimized: true },
  trailingSlash: true,
  devIndicators: false,
};

export default nextConfig;
