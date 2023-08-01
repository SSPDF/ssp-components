import { Meta, StoryObj } from '@storybook/react'
import FormBaseDecorator from '../../decorators/FormBaseDecorator'
import Table from '../components/form/table/Table'
import React from 'react'
import { Button, Paper, Stack } from '@mui/material'
import Link from 'next/link'

const meta: Meta<typeof Table> = {
    title: 'Base/Table',
    component: Table,
    tags: ['autodocs'],
    decorators: [FormBaseDecorator],
}

export default meta
type Story = StoryObj<typeof Table>

export const Base: Story = {
    args: {
        fetchFunc: () => fetch('http://localhost:7171/table'),
        csv: {
            fileName: 'Exemplo',
        },
        csvCustomKeyNames: {
            title: 'RONALD MCDONALD',
        },
        isPublic: true,
        columns: [
            {
                keyName: 'id',
                title: 'Id do post',
            },
            {
                keyName: 'name',
                title: 'Nome',
            },
            {
                keyName: 'status',
                title: 'Status',
            },
        ],
        statusKeyName: 'status',
        csvExcludeKeys: ['body'],
        csvExcludeValidate: (key, value) =>
            key === 'body' &&
            value ===
                'est rerum tempore vitae\nsequi sint nihil reprehenderit dolor beatae ea dolores neque\nfugiat blanditiis voluptate porro vel nihil molestiae ut reiciendis\nqui aperiam non debitis possimus qui neque nisi nulla',
        columnSize: 4,
        filters: [
            {
                key: 'id',
                options: ['3', '4', '8', '0'],
                name: 'Filtro de ID',
            },

            {
                key: 'name',
                options: ['Teste 2', 'Teste 3'],
                name: 'Nome',
            },
        ],
        itemCount: 20,
        csvShowAllButton: true,
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
    },
}
