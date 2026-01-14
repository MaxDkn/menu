import type { NextConfig } from "next";

const nextConfig: NextConfig = {
    output: "export",
    basePath: `/menu`,
    assetPrefix: `/menu/`,
    images: {
        unoptimized: true
    }
};

export default nextConfig;
