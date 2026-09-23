import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import FormProvider from '../../providers/FormProvider'
import GenericTable from './GenericTable'
import Table from './Table'
import { FilterValue } from './types'

/**
 * Para renderizar no SSR, as tabelas deixaram de ler o `localStorage` no primeiro
 * render (UPGRADE_PLAN.md 5.11, ver `Table.ssr.test.tsx`). Estes testes garantem que
 * o comportamento no browser foi preservado: o filtro salvo continua aparecendo
 * depois da montagem, e é descartado se a definição dos filtros mudou.
 */

const dados = [
    { id: '1', nome: 'Maria Souza' },
    { id: '2', nome: 'João Lima' },
]
const colunas = [
    { keyName: 'id', title: 'id' },
    { keyName: 'nome', title: 'Nome' },
]
const filtros: FilterValue[] = [{ label: 'Nome', keyName: 'nome', type: 'string', operator: 'contem', operators: ['contem'], value: '' }]

function salvarFiltro(id: string, definicao: FilterValue[] = filtros) {
    localStorage.setItem(`tableFilterCache_${id}`, JSON.stringify(definicao))
    localStorage.setItem(`tableFilter_${id}`, JSON.stringify([{ ...filtros[0], value: 'Maria' }]))
}

describe('filtro salvo no localStorage', () => {
    it('Table mostra o filtro salvo depois de montar', async () => {
        salvarFiltro('t1')
        render(
            <FormProvider onSubmit={() => {}}>
                <Table id='t1' tableName='Pessoa' useKC={false} columnSize={4} itemCount={10} initialData={dados} columns={colunas} filters={filtros} action={() => null} />
            </FormProvider>,
        )
        expect(await screen.findByText('Maria', { selector: 'p' })).toBeInTheDocument()
        expect(screen.getByText('contem')).toBeInTheDocument()
    })

    it('Table descarta o filtro salvo quando a definição dos filtros mudou', async () => {
        salvarFiltro('t2', [{ ...filtros[0], label: 'Outro' }])
        render(
            <FormProvider onSubmit={() => {}}>
                <Table id='t2' tableName='Pessoa' useKC={false} columnSize={4} itemCount={10} initialData={dados} columns={colunas} filters={filtros} action={() => null} />
            </FormProvider>,
        )
        await screen.findByText('Maria Souza')
        expect(localStorage.getItem('tableFilter_t2')).toBeNull()
        expect(screen.queryByText('contem')).not.toBeInTheDocument()
    })

    it('GenericTable mostra o filtro salvo depois de montar', async () => {
        salvarFiltro('g1')
        render(<GenericTable id='g1' tableName='Pessoa' useKC={false} columnSize={4} itemCount={10} initialData={dados} columns={colunas} filters={filtros} action={() => null} />)
        expect(await screen.findByText('Maria', { selector: 'p' })).toBeInTheDocument()
        expect(screen.getByText('contem')).toBeInTheDocument()
    })
})
