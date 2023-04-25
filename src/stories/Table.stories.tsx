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
        fetchFunc: () => fetch('https://jsonplaceholder.typicode.com/posts'),
        csv: {
            fileName: 'Exemplo',
        },
        columns: [
            {
                keyName: 'id',
                title: 'Id do post',
            },
            {
                keyName: 'title',
                title: 'Titulo',
            },
            {
                keyName: 'body',
                title: 'Conteudo',
            },
        ],
        columnSize: 4,
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
