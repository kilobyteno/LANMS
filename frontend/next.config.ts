import type { NextConfig } from "next";

const nextConfig: NextConfig = {
    output: "standalone",
    reactStrictMode: true,
    eslint: {
        dirs: ["src"],
    },
};

export default nextConfig;
