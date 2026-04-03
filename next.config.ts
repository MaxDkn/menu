import type { NextConfig } from "next";

const nextConfig: NextConfig = {
    output: "export",
    basePath: `/menu`,
    assetPrefix: `/menu/`,
    images: {
        unoptimized: true
    },
    allowedDevOrigins: ["192.168.1.*"],
};

export default nextConfig;
