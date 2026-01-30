import { Meta, StoryObj } from '@storybook/nextjs'
import Input from '../components/form/input/Input'
import FormBaseDecorator from '../decorators/FormBaseDecorator'
import { useEffect, useState } from 'react'
import { Box, Typography, CircularProgress } from '@mui/material'

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
        const [cepValue, setCepValue] = useState<string>('')
        const [cpfValue, setCpfValue] = useState<string>('')
        const [loading, setLoading] = useState(true)

        useEffect(() => {
            // Simula uma requisição que retorna dados sem formatação
            setTimeout(() => {
                const dadosDaAPI = {
                    cep: '71090395', // CEP vem sem máscara da API
                    cpf: '12345678901', // CPF vem sem máscara da API
                }
                setCepValue(dadosDaAPI.cep)
                setCpfValue(dadosDaAPI.cpf)
                setLoading(false)
            }, 1500)
        }, [])

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
                <Input type='cep' name='cep' title='CEP' required watchValue={cepValue} />
                <Input type='cpf' name='cpf' title='CPF' required watchValue={cpfValue} />
            </Box>
        )
    },
}
