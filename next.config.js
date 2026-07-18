/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // googleapis pulls in some Node-only deps; keep them server-side only.
  serverExternalPackages: ["googleapis"],
};

module.exports = nextConfig;
