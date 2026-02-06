/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  transpilePackages: ['@matrimony/shared'],
  output: 'standalone',
};

module.exports = nextConfig;
