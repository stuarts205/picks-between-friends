import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async redirects(){
    return [
      {
        source: '/',
        destination: '/home',
        permanent: false,
      }
    ]
  },
  images: {
        remotePatterns: [
          {
            protocol: 'https',
            hostname: 'a.espncdn.com',
            port: '',
            pathname: '/i/teamlogos/**',
          },
        ],
      },
};

export default nextConfig;
