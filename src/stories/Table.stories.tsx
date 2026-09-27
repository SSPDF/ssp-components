import { Button } from '@mui/material'
import { Meta, StoryObj } from '@storybook/nextjs'
import Table from '../components/form/table/Table'
import FormBaseDecorator from '../decorators/FormBaseDecorator'
import tabelaMock from './tabela-mock.json'
import { expect, userEvent, waitFor, within } from 'storybook/test'
import { ordemNaTela, pagina } from './interacao'

/**
 * `Table` com `fetchFunc` — o uso principal do componente.
 *
 * Esta story ficou **inteiramente comentada** até a Etapa 0: dependia do json-server
 * (`npm run api`, porta 7171), então sem o servidor de pé ela quebrava, ninguém a
 * mantinha ligada e o `Table` com fetch ficou sem verificação nenhuma. Agora o
 * `fetchFunc` devolve um `Response` montado a partir de um JSON estático — a story
 * fica determinística e passível de snapshot no CI.
 *
 * Para apontar de volta para a API de teste: troque `fetchFunc` por
 * `() => fetch('http://localhost:7171/table')` e rode `npm run api`.
 *
 * Diferente de `Base/Table (sem o fetchFunc)`, que usa `as unknown` para passar
 * props que não existem mais em `TableProps` (`csv`, `csvCustomKeyNames`,
 * `statusKeyName`…), estas stories são tipadas de verdade contra a API atual.
 */
const meta: Meta<typeof Table> = {
    title: 'Base/Table',
    component: Table,
    tags: ['autodocs'],
    decorators: [FormBaseDecorator],
}

export default meta
type Story = StoryObj<typeof Table>

const respostaJson =
    (corpo: unknown, status = 200) =>
    () =>
        Promise.resolve(new Response(JSON.stringify(corpo), { status, headers: { 'Content-Type': 'application/json' } }))

const base = {
    id: 'tabela-eventos',
    tableName: 'Evento',
    useKC: false,
    dataPath: 'body.data',
    columnSize: 6,
    itemCount: 20,
    columns: [
        { keyName: 'noEvento', title: 'Evento' },
        { keyName: 'noTableRa', title: 'Região administrativa' },
        { keyName: 'dtTableInicio', title: 'Início' },
        { keyName: 'stTableStatus', title: 'Status' },
    ],
    action: () => (
        <Button variant='contained' size='small' sx={{ backgroundColor: '#64748B' }}>
            detalhes
        </Button>
    ),
}

export const Base: Story = {
    args: {
        ...base,
        fetchFunc: respostaJson(tabelaMock),
    },
}

/**
 * Com exportação de CSV (`csvConfig`).
 */
export const ComExportacaoCsv: Story = {
    args: {
        ...base,
        fetchFunc: respostaJson(tabelaMock),
        csvConfig: {
            fileName: 'Eventos',
            downloadAll: true,
            map: [
                { name: 'Evento', key: 'noEvento' },
                { name: 'Região administrativa', key: 'noTableRa' },
                { name: 'Início', key: 'dtTableInicio' },
            ],
        },
    },
}

/**
 * Com a barra de filtros e ordenação.
 */
export const ComFiltros: Story = {
    args: {
        ...base,
        fetchFunc: respostaJson(tabelaMock),
        filters: [
            { label: 'Evento', keyName: 'noEvento', type: 'string', operator: 'contem', operators: ['contem', 'igual'], value: '' },
            { label: 'Início', keyName: 'dtTableInicio', type: 'date', operator: 'tem a data', operators: ['tem a data', 'após', 'antes de', 'entre'], value: '' },
        ],
        orderBy: [
            { key: 'noEvento', label: 'Evento', type: 'string' },
            { key: 'noTableRa', label: 'Região administrativa', type: 'string' },
        ],
    },
}

/**
 * Resposta sem conteúdo — o componente trata `statusCode: 204` renderizando a
 * tabela vazia com a `emptyMsg`.
 */
export const SemResultados: Story = {
    args: {
        ...base,
        fetchFunc: respostaJson({ statusCode: 204 }),
        emptyMsg: { user: 'Nenhum evento encontrado', public: 'Nenhum evento encontrado' },
    },
}

/**
 * Falha da API — `res.ok === false` leva o componente ao estado de erro.
 */
export const ErroDaApi: Story = {
    args: {
        ...base,
        fetchFunc: () => Promise.resolve(new Response('erro', { status: 500 })),
    },
}

/**
 * `statusCode: 403` tem tratamento próprio, separado do erro genérico.
 */
export const SemPermissao: Story = {
    args: {
        ...base,
        fetchFunc: respostaJson({ statusCode: 403 }),
    },
}

const EVENTOS = ['VOLTA DO MUNDO BAMBAS – VMB7', 'Marilônio - a FESTA', 'Festa Julina', 'FESTA AGOSTINA', 'FECOMÉRCIO MAIS PERTO DE TODOS GAMA', 'BRASILIENSE X GAMA']

/** Busca pelo texto, filtro pelo popover e ordenação pelo menu, sobre os 7 registros do mock. */
export const Interacao: Story = {
    tags: ['interacao'],
    args: ComFiltros.args,
    play: async ({ canvasElement }) => {
        const canvas = within(canvasElement)
        await expect(await canvas.findByText('Exibindo 1-7 de 7')).toBeVisible()

        const busca = canvas.getByPlaceholderText('Pesquisar Evento')
        await userEvent.type(busca, 'festa')
        await expect(await canvas.findByText('Exibindo 1-3 de 3')).toBeVisible()
        await expect(canvas.queryByText('BRASILIENSE X GAMA')).toBeNull()
        await userEvent.clear(busca)
        await expect(await canvas.findByText('Exibindo 1-7 de 7')).toBeVisible()

        await userEvent.click(canvas.getByRole('button', { name: 'Filtrar' }))
        const filtro = pagina(canvasElement)
        await userEvent.type(await filtro.findByPlaceholderText('Valor'), 'gama')
        const botoesFiltrar = filtro.getAllByRole('button', { name: 'Filtrar' })
        await userEvent.click(botoesFiltrar[botoesFiltrar.length - 1])
        await expect(await canvas.findByText('Exibindo 1-2 de 2')).toBeVisible()
        await userEvent.click(canvas.getByRole('button', { name: 'Filtrar' }))
        await userEvent.click(await filtro.findByRole('button', { name: 'Limpar' }))
        await userEvent.keyboard('{Escape}')
        await expect(await canvas.findByText('Exibindo 1-7 de 7')).toBeVisible()

        await userEvent.click(canvas.getByRole('button', { name: 'Ordenar' }))
        await userEvent.click(await filtro.findByRole('menuitem', { name: 'Evento' }))
        await waitFor(() => expect(ordemNaTela(canvasElement, EVENTOS)).toEqual([...EVENTOS].sort((a, b) => a.localeCompare(b, 'pt-BR'))))
    },
}

/**
 * Duas `Table` na mesma página, com `id`s diferentes: o filtro de uma não vaza para a outra.
 * Até a 0.4.0 o nome da chave do filtro era uma variável de módulo, e as duas tabelas liam e
 * gravavam os filtros da última que renderizou (UPGRADE_PLAN.md 5.13a).
 */
export const InteracaoDuasTabelas: Story = {
    tags: ['interacao'],
    render: (args) => (
        <>
            <div data-testid='tabela-a'>
                <Table {...args} id='tabela-a' tableName='Tabela A' />
            </div>
            <div data-testid='tabela-b'>
                <Table {...args} id='tabela-b' tableName='Tabela B' />
            </div>
        </>
    ),
    args: ComFiltros.args,
    play: async ({ canvasElement }) => {
        const a = within(within(canvasElement).getByTestId('tabela-a'))
        const b = within(within(canvasElement).getByTestId('tabela-b'))
        await expect(await a.findByText('Exibindo 1-7 de 7')).toBeVisible()
        await expect(await b.findByText('Exibindo 1-7 de 7')).toBeVisible()

        await userEvent.click(a.getByRole('button', { name: 'Filtrar' }))
        const filtro = pagina(canvasElement)
        await userEvent.type(await filtro.findByPlaceholderText('Valor'), 'gama')
        const botoes = filtro.getAllByRole('button', { name: 'Filtrar' })
        await userEvent.click(botoes[botoes.length - 1])

        await expect(await a.findByText('Exibindo 1-2 de 2')).toBeVisible()
        await expect(b.getByText('Exibindo 1-7 de 7')).toBeVisible()
        await waitFor(() => expect(localStorage.getItem('tableFilter_tabela-b')).toBeNull())
    },
}

/**
 * `customTableStyle` com estilos soltos, como o `viva-flor-frontend` passa (`border`, `borderRadius`).
 * Eram system props do `Box`, que o MUI 9 removeu; a lib agora os leva para o `sx`, com a mesma
 * precedência do MUI 5: a borda do app vale, e o `borderRadius` da lib vence o do app.
 */
export const InteracaoEstiloDoApp: Story = {
    tags: ['interacao'],
    args: {
        ...Base.args,
        customTableStyle: { border: '1px solid #E2E8F0', borderRadius: 3, 'data-testid': 'caixa-da-tabela' },
    },
    play: async ({ canvasElement }) => {
        const caixa = await within(canvasElement).findByTestId('caixa-da-tabela')
        const css = getComputedStyle(caixa)
        await expect(css.borderTopWidth).toBe('1px')
        await expect(css.borderTopStyle).toBe('solid')
        await expect(css.borderTopColor).toBe('rgb(226, 232, 240)')
        await expect(css.borderTopLeftRadius).toBe('24px')
    },
}
