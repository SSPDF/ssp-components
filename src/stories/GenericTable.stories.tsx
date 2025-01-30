import { Meta, StoryObj } from '@storybook/react'
import FormBaseDecorator from '../../decorators/FormBaseDecorator'
import React from 'react'
import { Button, Paper, Stack } from '@mui/material'
import Link from 'next/link'
import { GenericTable } from '../components/form/table/GenericTable'

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
