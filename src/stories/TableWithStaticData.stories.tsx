import { Button, Paper, Stack } from '@mui/material'
import { Meta, StoryObj } from '@storybook/nextjs'
import Link from 'next/link'
import Table from '../components/form/table/Table'
import FormBaseDecorator from '../decorators/FormBaseDecorator'

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

const meta: Meta<typeof Table> = {
    title: 'Base/Table (sem o fetchFunc)',
    component: Table,
    tags: ['autodocs'],
    decorators: [FormBaseDecorator],
}

export default meta
type Story = StoryObj<typeof Table>

export const Base: Story = {
    args: {
        initialData: fakeData,
        // fetchFunc: () => fetch('http://localhost:7171/table'),
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
                // size: 2,
            },
            {
                keyName: 'status',
                title: 'Status do Evento',
            },
        ],
        orderBy: [
            {
                key: 'name',
                label: 'Nome',
                type: 'string',
            },
            {
                key: 'status',
                label: 'status',
                type: 'string',
            },
        ],
        statusKeyName: 'status',
        csvExcludeKeys: ['body'],
        csvExcludeUpper: ['name'],
        csvExcludeKeysCSV: ['name'],
        csvExcludeValidate: (key, value) => key === 'status' && value !== 'R',
        columnSize: 6,
        itemCount: 20,
        csvShowAllButton: true,
        csvWithoutZip: true,
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
        filters: [{ label: 'Nome', keyName: 'name', type: 'string', operator: 'contem', operators: ['contem', 'igual'], value: '' }],
    } as unknown,
}
