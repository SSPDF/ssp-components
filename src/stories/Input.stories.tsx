import { Meta, StoryObj } from '@storybook/nextjs'
import Input from '../components/form/input/Input'
import FormBaseDecorator from '../decorators/FormBaseDecorator'
import { useContext, useEffect, useState } from 'react'
import { Box, Typography, CircularProgress } from '@mui/material'
import { FormContext } from '../context/form'
import { expect, userEvent, within } from 'storybook/test'
import { dadosEnviados, enviar, esperarErroDeValidacao } from './interacao'

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

/** Campo "Saudação" sincronizado com "Nome" via watchValue. Digite no Nome e veja a Saudação atualizar. */
function InputComWatchValue() {
    const context = useContext(FormContext)!
    const nome = context.formWatch('nome') ?? ''
    return <Input name='saudacao' type='input' title='Saudação (observa Nome)' watchValue={`Olá, ${nome}`} />
}

export const ComWatchValue: Story = {
    render: () => (
        <Box display='flex' flexDirection='column' gap={2}>
            <Input type='input' name='nome' title='Nome' required />
            <InputComWatchValue />
        </Box>
    ),
}

/** CPF: máscara aplicada na digitação, obrigatório, tamanho mínimo e valor enviado com máscara. */
export const InteracaoCpf: Story = {
    tags: ['interacao'],
    args: { name: 'cpf', title: 'CPF', type: 'cpf', required: true },
    play: async ({ canvasElement }) => {
        const campo = within(canvasElement).getByRole('textbox')
        await enviar(canvasElement)
        await esperarErroDeValidacao(canvasElement)

        await userEvent.type(campo, '123456')
        await expect(campo).toHaveValue('123.456')
        await enviar(canvasElement)
        await esperarErroDeValidacao(canvasElement, 'O CPF precisa ter no mínimo 11 dígitos')

        await userEvent.type(campo, 'abc78909')
        await expect(campo).toHaveValue('123.456.789-09')
        await enviar(canvasElement)
        await expect(await dadosEnviados(canvasElement)).toEqual({ cpf: '123.456.789-09' })
    },
}

/** Telefone: a máscara troca de fixo para celular conforme a quantidade de dígitos. */
export const InteracaoTelefone: Story = {
    tags: ['interacao'],
    args: { name: 'telefone', title: 'Telefone', type: 'phone', required: true },
    play: async ({ canvasElement }) => {
        const campo = within(canvasElement).getByRole('textbox')
        await userEvent.type(campo, '6133334444')
        await expect(campo).toHaveValue('(61) 3333-4444')

        await userEvent.clear(campo)
        await userEvent.type(campo, '61987654321')
        await expect(campo).toHaveValue('(61) 98765-4321')
        await enviar(canvasElement)
        await expect(await dadosEnviados(canvasElement)).toEqual({ telefone: '(61) 98765-4321' })
    },
}

/**
 * E-mail: formato inválido barra o envio. Quem barra é a validação nativa do browser
 * (`<input type='email'>` num `<form>` sem `noValidate`), antes da validação da lib: a
 * mensagem da lib não aparece, e o browser mostra a dele.
 */
export const InteracaoEmail: Story = {
    tags: ['interacao'],
    args: { name: 'email', title: 'E-mail', type: 'email', required: true },
    play: async ({ canvasElement }) => {
        const campo = within(canvasElement).getByRole('textbox') as HTMLInputElement
        await userEvent.type(campo, 'fulano@')
        await enviar(canvasElement)
        await expect(campo.validity.valid).toBe(false)
        await expect(within(canvasElement).queryByTestId('dados-enviados')).toBeNull()

        await userEvent.type(campo, 'ssp.df.gov.br')
        await enviar(canvasElement)
        await expect(await dadosEnviados(canvasElement)).toEqual({ email: 'fulano@ssp.df.gov.br' })
    },
}

/**
 * Edição: os dados chegam da "API" sem máscara (`formReset`) e aparecem mascarados nos campos.
 * Editar um campo e enviar mantém os outros como vieram.
 */
export const InteracaoEdicao: Story = {
    tags: ['interacao'],
    render: EdicaoComRequisicao.render,
    play: async ({ canvasElement }) => {
        const canvas = within(canvasElement)
        const cpf = await canvas.findByDisplayValue('123.456.789-01', {}, { timeout: 5000 })
        await expect(canvas.getByDisplayValue('71090-395')).toBeVisible()
        await expect(canvas.getByDisplayValue('João da Silva')).toBeVisible()

        await userEvent.clear(cpf)
        await userEvent.type(cpf, '98765432100')
        await expect(cpf).toHaveValue('987.654.321-00')
        await enviar(canvasElement)
        await expect(await dadosEnviados(canvasElement)).toEqual({ nome: 'João da Silva', cep: '71090-395', cpf: '987.654.321-00' })
    },
}
