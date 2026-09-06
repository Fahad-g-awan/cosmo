/** @type {import('next').NextConfig} */
const nextConfig = {
  transpilePackages: [
    "@cosmediate/ui",
    "@cosmediate/header",
    "@cosmediate/footer",
    "@cosmediate/i18n",
    "@cosmediate/auth",
    "@cosmediate/api",
    "@cosmediate/config",
    "@cosmediate/notifications",
    "@cosmediate/seo",
    "@cosmediate/type-utils",
  ],
  images: {
    // unoptimized: true,
    remotePatterns: [
      {
        protocol: "https",
        hostname: "eu-cosmediate.s3.eu-central-1.amazonaws.com",
      },
      {
        protocol: "https",
        hostname: "cosmediate.s3.amazonaws.com",
      },
      {
        protocol: "https",
        hostname: "media.istockphoto.com",
      },
      {
        protocol: "https",
        hostname: "plus.unsplash.com",
      },
      {
        protocol: "https",
        hostname: "img.clerk.com",
      },
      {
        protocol: "https",
        hostname: "cdn.sanity.io",
      },
    ],
  },
};

export default nextConfig;
