import { Box, Button, Paper, Stack, Typography } from '@mui/material'
import { Meta, StoryObj } from '@storybook/nextjs'
import Link from 'next/link'
import { GenericTable } from '../components/form/table/GenericTable'
import FormBaseDecorator from '../decorators/FormBaseDecorator'
import React from 'react'

interface FakeDataProps {
    id: string
    name: string
    date: string
    status: string
}

const fakeData: FakeDataProps[] = [
    {
        date: new Date().toLocaleString('pt-BR'),
        id: '1234',
        name: 'Pedro Matias',
        status: 'ATIVO',
    },
    {
        date: new Date().toLocaleString('pt-BR'),
        id: '9876',
        name: 'Jose Afonso',
        status: 'INATIVO',
    },
]

const meta: Meta<typeof GenericTable> = {
    title: 'Base/GenericTable',
    component: GenericTable,
    tags: ['autodocs'],
    decorators: [FormBaseDecorator],
}

export default meta
type Story = StoryObj<typeof GenericTable>

export const Base: Story = {
    args: {
        initialData: fakeData,
        useKC: false,
        csv: {
            fileName: 'Exemplo',
        },
        csvCustomKeyNames: {
            title: 'RONALD MCDONALD',
        },
        columns: [
            {
                keyName: 'id',
                title: 'id',
            },
            {
                keyName: 'name',
                title: 'Nome',
            },
            {
                keyName: 'date',
                title: 'Datas',
                size: 2,
            },
            {
                keyName: 'status',
                title: 'Status do Evento',
            },
        ],
        orderBy: [{ key: 'name', label: 'nome', type: 'string' }],
        statusKeyName: 'status',
        csvExcludeKeys: ['body'],
        csvExcludeUpper: ['name'],
        csvExcludeKeysCSV: ['name'],
        csvExcludeValidate: (key, value) => key === 'status' && value !== 'R',
        columnSize: 6,
        itemCount: 20,
        csvShowAllButton: true,
        csvWithoutZip: true,
        csvButtonTitle: 'Salvar em .ZIP',
        csvNoZipText: 'Salvar em .CSV',
        action: (data) => (
            <Stack direction='row' spacing={1.5}>
                <Paper elevation={12} sx={{ '& a': { textDecoration: 'none' } }}>
                    <Link href={`/detalhes/${data['coSeqEventoExterno']}`}>
                        <Button variant='contained' size='small' sx={{ backgroundColor: '#64748B' }}>
                            detalhes
                        </Button>
                    </Link>
                </Paper>
            </Stack>
        ),
        normalize: true,
        csvUpper: true,
        removeQuotes: true,
        generateCsvZip: true,
        csvZipFileNamesKey: 'status',
        // filters: {
        //      : [
        //         {
        //             type: 'a-z',
        //             keyName: 'name',
        //             name: 'Ordem alfabetica: A -> Z',
        //         },
        //         {
        //             type: 'z-a',
        //             keyName: 'name',
        //             name: 'Ordem alfabetica: Z -> A',
        //         },
        //     ],
        //     Status: [
        //         {
        //             type: 'items',
        //             keyName: 'status',
        //             name: '',
        //             referenceKey: 'id',
        //             options: [
        //                 {
        //                     key: 'p',
        //                     color: '#F59E0B',
        //                     name: 'EM ANÁLISE',
        //                 },
        //                 {
        //                     key: 'a',
        //                     color: '#0EA5E9',
        //                     name: 'CADASTRADO',
        //                 },
        //                 {
        //                     key: 'c',
        //                     color: '#a1a1a1',
        //                     name: 'CANCELADO',
        //                 },
        //                 {
        //                     key: 'r',
        //                     color: '#EF4444',
        //                     name: 'REPROVADO',
        //                 },
        //                 {
        //                     key: 'l',
        //                     color: '#22C55E',
        //                     name: 'LICENCIADO',
        //                 },

        //                 { key: 'pa', color: '#6366F1', name: 'PRÉ APROVADO' },
        //             ],
        //         },
        //     ],
        //     Datas: [
        //         {
        //             type: 'date-interval',
        //             keyName: 'date',
        //             name: 'Intervalo de data',
        //         },
        //         {
        //             type: 'data-a-z',
        //             keyName: 'date',
        //             name: 'Ordem crescente',
        //         },
        //         {
        //             type: 'data-z-a',
        //             keyName: 'date',
        //             name: 'Ordem decrescente',
        //         },
        //     ],
        // },
    },
}

export const APIPaginada: Story = {
    render: (args) => {
        const [data, setData] = React.useState<FakeDataProps[] | null>(null)
        const [loading, setLoading] = React.useState(true)

        React.useEffect(() => {
            // Simulando uma chamada de API
            setTimeout(() => {
                const fakeResponse: FakeDataProps[] = Array.from({ length: 53 }).map((_, i) => ({
                    id: (i + 1).toString(),
                    name: `Usuário ${i + 1}`,
                    date: new Date().toLocaleString('pt-BR'),
                    status: i % 2 === 0 ? 'ATIVO' : 'INATIVO',
                }))
                setData(fakeResponse)
                setLoading(false)
            }, 1000)
        }, [])

        return <GenericTable {...args} initialData={data} isLoading={loading} />
    },
    args: {
        ...Base.args,
        itemCount: 10,
    },
}

const PAGE_SIZE = 10
const TOTAL_ITEMS_MOCK = 47

function fakeApiFetchPage(page: number): Promise<{ items: FakeDataProps[]; total: number }> {
    return new Promise((resolve) => {
        setTimeout(() => {
            const start = (page - 1) * PAGE_SIZE
            const end = Math.min(start + PAGE_SIZE, TOTAL_ITEMS_MOCK)
            const items: FakeDataProps[] = Array.from({ length: end - start }).map((_, i) => {
                const idx = start + i + 1
                return {
                    id: idx.toString(),
                    name: `Usuário ${idx}`,
                    date: new Date().toLocaleString('pt-BR'),
                    status: idx % 2 === 0 ? 'ATIVO' : 'INATIVO',
                }
            })
            resolve({ items, total: TOTAL_ITEMS_MOCK })
        }, 600)
    })
}

interface ApiCallLog {
    page: number
    at: string
}

export const PaginacaoServerSide: Story = {
    render: (args) => {
        const [page, setPage] = React.useState(1)
        const [data, setData] = React.useState<FakeDataProps[]>([])
        const [totalCount, setTotalCount] = React.useState(0)
        const [loading, setLoading] = React.useState(true)
        const [apiCalls, setApiCalls] = React.useState<ApiCallLog[]>([])

        const loadPage = React.useCallback(async (pageNum: number) => {
            setLoading(true)
            setApiCalls((prev) => [
                ...prev,
                { page: pageNum, at: new Date().toLocaleTimeString('pt-BR', { hour12: false }) },
            ])
            const { items, total } = await fakeApiFetchPage(pageNum)
            setData(items)
            setTotalCount(total)
            setLoading(false)
        }, [])

        React.useEffect(() => {
            loadPage(page)
        }, [page, loadPage])

        return (
            <Stack spacing={2}>
                <Box
                    sx={{
                        p: 2,
                        bgcolor: '#f0f9ff',
                        borderRadius: 2,
                        border: '1px solid #bae6fd',
                    }}
                >
                    <Typography variant="subtitle2" fontWeight={700} color="#0369a1" gutterBottom>
                        Chamadas à API (prova de paginação server-side)
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                        Cada troca de página dispara uma nova requisição. Registros abaixo:
                    </Typography>
                    {apiCalls.length === 0 ? (
                        <Typography variant="body2" color="text.secondary">
                            Nenhuma chamada ainda.
                        </Typography>
                    ) : (
                        <Stack direction="column" component="ul" sx={{ m: 0, pl: 2.5, listStyle: 'disc' }} spacing={0.5}>
                            {apiCalls.map((call, i) => (
                                <Typography key={i} component="li" variant="body2" display="block">
                                    <strong>Página {call.page}</strong> às {call.at}
                                </Typography>
                            ))}
                        </Stack>
                    )}
                </Box>
                <GenericTable
                    {...args}
                    id="generic-table-server-side"
                    serverSidePagination
                    page={page}
                    onPageChange={setPage}
                    initialData={data}
                    totalCount={totalCount}
                    pageLimit={PAGE_SIZE}
                    isLoading={loading}
                />
            </Stack>
        )
    },
    args: {
        ...Base.args,
        id: 'generic-table-server-side',
        itemCount: PAGE_SIZE,
    },
}
