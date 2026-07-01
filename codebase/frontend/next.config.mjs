/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',
  async redirects() {
    return [
      { source: '/signup', destination: '/register', permanent: true },
    ]
  },
}

export default nextConfig
