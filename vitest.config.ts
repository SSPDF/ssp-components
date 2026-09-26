import { defineConfig } from 'vitest/config'

/**
 * Suíte de testes da lib (Etapa 0 do UPGRADE_PLAN.md).
 *
 * Até aqui o repo não tinha runner de teste nenhum — as stories eram a única
 * superfície de verificação. O foco inicial é o que story nenhuma cobre:
 * os dois providers de autenticação (519 + 250 linhas, zero verificação).
 */
export default defineConfig({
    test: {
        environment: 'jsdom',
        globals: true,
        setupFiles: ['./src/test/setup.ts'],
        include: ['src/**/*.test.{ts,tsx}'],
        css: false,
    },
})
