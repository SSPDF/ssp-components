// Imports de CSS por efeito colateral (`import 'leaflet/dist/leaflet.css'`). O TypeScript 6 passou a
// conferir que eles resolvem (`noUncheckedSideEffectImports`); quem os carrega é o bundler do app.
declare module '*.css'
