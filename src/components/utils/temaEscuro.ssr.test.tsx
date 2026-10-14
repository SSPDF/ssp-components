// @vitest-environment node
import { ThemeProvider, createTheme } from '@mui/material'
import { renderToString } from 'react-dom/server'
import { describe, expect, it } from 'vitest'
import FormProvider from '../providers/FormProvider'
import Input from '../form/input/Input'
import Table from '../form/table/Table'

/**
 * Render no servidor com o tema escuro do jeito recomendado pelo MUI 9 (`colorSchemes` +
 * `cssVariables`). O CSS do escuro tem que sair já no HTML, como regra sob o seletor do esquema:
 * é o que evita o "piscar" de claro para escuro na hidratação. Se a lib decidisse a cor no JS
 * (pelo `palette.mode`), o servidor mandaria só o claro.
 */
describe('tema escuro no SSR', () => {
    const tema = createTheme({ cssVariables: { colorSchemeSelector: 'class' }, colorSchemes: { light: true, dark: true } })

    it('o CSS do escuro sai no HTML do servidor', () => {
        const html = renderToString(
            <ThemeProvider theme={tema}>
                <FormProvider onSubmit={() => {}}>
                    <Input name='nome' title='Nome' />
                    <Table id='ssr' tableName='Pessoa' useKC={false} columnSize={4} initialData={[{ id: '1', nome: 'Maria' }]} columns={[{ keyName: 'nome', title: 'Nome' }]} action={() => null} />
                </FormProvider>
            </ThemeProvider>,
        )
        expect(html).toContain('Pesquisar Pessoa')
        expect(html).toMatch(/\*:where\(\.dark\) \.css-[\w-]+\{background-color:var\(--mui-palette-background-paper\);\}/)
        // e as variáveis dos dois esquemas, que o ThemeProvider também manda no SSR
        expect(html).toContain('--mui-palette-background-paper:#121212')
    })
})
