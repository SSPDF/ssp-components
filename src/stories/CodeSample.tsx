import { Box } from '@mui/material'
import { noEscuro } from '../components/utils/temaEscuro'

/**
 * Bloco de código para as stories de exemplo.
 *
 * Substitui o `<Source>` de '@storybook/addon-docs/blocks', que depende do
 * `DocsContext` e por isso só funciona numa página de docs — usado dentro do
 * canvas de uma story ele quebra com `Cannot read properties of undefined
 * (reading 'fonts')` e a story inteira deixa de renderizar.
 *
 * Acompanha o tema escuro do Storybook como os componentes da lib (`noEscuro`).
 */
export default function CodeSample({ code }: { code: string }) {
    return (
        <Box
            component='pre'
            sx={(theme) => ({
                background: '#f6f8fa',
                border: '1px solid #e1e4e8',
                borderRadius: '4px',
                padding: '12px 16px',
                margin: '8px 0',
                overflowX: 'auto',
                fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Consolas, monospace',
                fontSize: 13,
                lineHeight: 1.5,
                color: '#24292e',
                ...noEscuro(theme, (p) => ({ background: p.action.hover, borderColor: p.divider, color: p.text.primary })),
            })}
        >
            <code>{code.trim()}</code>
        </Box>
    )
}
