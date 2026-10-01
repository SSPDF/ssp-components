// @vitest-environment node
import { renderToString } from 'react-dom/server'
import { describe, expect, it } from 'vitest'
import FormProvider from '../../providers/FormProvider'
import GenericTable from './GenericTable'
import Table from './Table'

/**
 * Render no servidor, como no `next build`/SSR: ambiente `node`, sem `window` nem
 * `localStorage`. Até a 0.1.x o `Table` lia o `localStorage` durante o render e
 * quebrava com `ReferenceError: localStorage is not defined` (UPGRADE_PLAN.md 5.11).
 */

const dados = [
    { id: '1', nome: 'Maria Souza', status: 'ATIVO' },
    { id: '2', nome: 'João Lima', status: 'INATIVO' },
]
const colunas = [
    { keyName: 'id', title: 'id' },
    { keyName: 'nome', title: 'Nome' },
    { keyName: 'status', title: 'Status' },
]

describe('tabelas no SSR', () => {
    it('ambiente sem localStorage', () => {
        expect(typeof localStorage).toBe('undefined')
    })

    it('Table renderiza no servidor', () => {
        const html = renderToString(
            <FormProvider onSubmit={() => {}}>
                <Table id='ssr' tableName='Pessoa' useKC={false} columnSize={4} itemCount={10} initialData={dados} columns={colunas} action={() => null} />
            </FormProvider>,
        )
        expect(html).toContain('Pesquisar Pessoa')
    })

    it('GenericTable renderiza no servidor', () => {
        const html = renderToString(<GenericTable id='ssr' tableName='Pessoa' useKC={false} columnSize={4} itemCount={10} initialData={dados} columns={colunas} action={() => null} />)
        expect(html).toContain('Pesquisar Pessoa')
    })
})
