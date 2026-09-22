import { Button } from '@mui/material'
import { Meta, StoryObj } from '@storybook/nextjs'
import Table from '../components/form/table/Table'
import FormBaseDecorator from '../decorators/FormBaseDecorator'
import tabelaMock from './tabela-mock.json'

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
