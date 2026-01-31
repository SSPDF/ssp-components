import { Meta, StoryObj } from '@storybook/nextjs'
import Input from '../components/form/input/Input'
import FormBaseDecorator from '../decorators/FormBaseDecorator'
import { useContext, useEffect, useState } from 'react'
import { Box, Typography, CircularProgress } from '@mui/material'
import { FormContext } from '../context/form'

const meta: Meta<typeof Input> = {
    title: 'Input/Input',
    component: Input,
    tags: ['autodocs'],
    argTypes: {
        type: {
            options: ['cnpj', 'cpf', 'input', 'email', 'cpf_cnpj', 'phone', 'input', 'number', 'rg', 'password', 'cep'],
            control: {
                type: 'select',
            },
        },
    },
    decorators: [FormBaseDecorator],
}

export default meta
type Story = StoryObj<typeof Input>

export const Base: Story = {
    args: {
        name: 'teste',
        required: true,
    },
}

export const EdicaoComRequisicao: Story = {
    render: () => {
        const [dadosDaAPI, setDadosDaAPI] = useState<{ cep: string; cpf: string; nome: string } | null>(null)
        const [loading, setLoading] = useState(true)
        const context = useContext(FormContext)

        useEffect(() => {
            // Simula uma requisição que retorna dados sem formatação
            setTimeout(() => {
                setDadosDaAPI({
                    cep: '71090395',
                    cpf: '12345678901',
                    nome: 'João da Silva',
                })
                // Usa reset do React Hook Form para preencher todos os campos de uma vez
                setLoading(false)
            }, 1500)
        }, [])

        useEffect(() => {
            if (!loading && dadosDaAPI) {
                context.formReset(dadosDaAPI, {
                    keepDirty: true,
                })
            }
        }, [loading, dadosDaAPI])

        if (loading) {
            return (
                <Box display='flex' alignItems='center' gap={2}>
                    <CircularProgress size={20} />
                    <Typography>Carregando dados...</Typography>
                </Box>
            )
        }

        return (
            <Box display='flex' flexDirection='column' gap={2}>
                <Input type='input' name='nome' title='Nome' required />
                <Input type='cep' name='cep' title='CEP' required />
                <Input type='cpf' name='cpf' title='CPF' required />
            </Box>
        )
    },
}
