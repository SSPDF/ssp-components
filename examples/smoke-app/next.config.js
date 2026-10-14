/** @type {import('next').NextConfig} */
module.exports = {
    reactStrictMode: true,
    // A lib é publicada como ESM+CJS e importa CSS; transpilar evita
    // surpresa de interop no SSR.
    transpilePackages: ['@ssplib/react-components'],
    // O e2e do Keycloak (scripts/e2e-keycloak.sh) builda com basePath, como os apps.
    ...(process.env.SMOKE_BASE_PATH ? { basePath: process.env.SMOKE_BASE_PATH } : {}),
}
