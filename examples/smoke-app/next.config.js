/** @type {import('next').NextConfig} */
module.exports = {
    reactStrictMode: true,
    // A lib é publicada como ESM+CJS e importa CSS; transpilar evita
    // surpresa de interop no SSR.
    transpilePackages: ['@ssplib/react-components'],
}
