/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'via.placeholder.com',
      },
      {
        protocol: 'https', 
        hostname: 'images.unsplash.com',
      },
      {
        protocol: 'https',
        hostname: '**', // Erlaubt alle HTTPS-Bilder
      },
    ],
  },
  // App Router ist standardmäßig aktiviert
}

module.exports = nextConfig