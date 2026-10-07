/** @type {import('next').NextConfig} */
const nextConfig = {
  cacheComponents: false,
  headers: () => [
    {
      headers: [
        { key: 'Cross-Origin-Opener-Policy', value: 'same-origin' },
        { key: 'Cross-Origin-Embedder-Policy', value: 'require-corp' },
      ],
      source: '/:path*',
    },
  ],
  output: 'standalone',
  reactCompiler: false,
  reactStrictMode: false,
};

export default nextConfig;
