/**
 * Bloco de código para as stories de exemplo.
 *
 * Substitui o `<Source>` de '@storybook/addon-docs/blocks', que depende do
 * `DocsContext` e por isso só funciona numa página de docs — usado dentro do
 * canvas de uma story ele quebra com `Cannot read properties of undefined
 * (reading 'fonts')` e a story inteira deixa de renderizar.
 */
export default function CodeSample({ code }: { code: string }) {
    return (
        <pre
            style={{
                background: '#f6f8fa',
                border: '1px solid #e1e4e8',
                borderRadius: 4,
                padding: '12px 16px',
                margin: '8px 0',
                overflowX: 'auto',
                fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Consolas, monospace',
                fontSize: 13,
                lineHeight: 1.5,
                color: '#24292e',
            }}
        >
            <code>{code.trim()}</code>
        </pre>
    )
}
