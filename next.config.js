/** @type {import('next').NextConfig} */
const nextConfig = {
    reactStrictMode: true,
    images: {
        domains: ['picsum.photos', 'pet-clinic.hexagun.mx'],
        remotePatterns: [
            {
                protocol: 'https',
                hostname: 'picsum.photos',
                port: '',
                pathname: '/**',
            },
            {
                protocol: 'https',
                hostname: 'pet-clinic.hexagun.mx',
                port: '',
                pathname: '/**',
            },
        ],
    },
}

module.exports = nextConfig
