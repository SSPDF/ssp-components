import { Button, Grid } from '@mui/material'
import { Source } from '@storybook/addon-docs/blocks'
import { Meta, StoryObj } from '@storybook/react-webpack5'
import { useState } from 'react'
import 'react-toastify/ReactToastify.min.css'
import Input from '../components/form/input/Input'
import FormProvider from '../components/providers/FormProvider'
import { SspComponentsProvider } from '../components/providers/SspComponentsProvider'

const meta: Meta<typeof Teste> = {
    title: 'Exemplo/Inputs',
    component: Teste,
    tags: ['autodocs'],
    // decorators: [FormBaseDecorator],
}

export default meta
type Story = StoryObj<typeof Teste>

export const Base: Story = {
    args: {},
}

function Teste() {
    const [dados, setDados] = useState({})

    function submit(dt, files) {
        setDados({
            dados: dt,
            files: files,
        })
        console.log({
            dados: dt,
            files: files,
        })
    }

    return (
        <SspComponentsProvider>
            <FormProvider onSubmit={submit}>
                {/* Esse grid é opcional para dar espaçamento */}
                <Grid container>
                    <Input name='nome' type='input' title='Nome' required />
                    <Grid size={12}>
                        <Source code={`<Input name='nome' type='input' title='Nome' required />`} />
                    </Grid>
                    <Input name='celular' type='phone' title='Celular' />
                    <Grid size={12}>
                        <Source code={`<Input name='celular' type='phone' title='Celular' />`} />
                    </Grid>

                    <Input name='cpf' type='cpf' title='CPF' />
                    <Grid size={12}>
                        <Source code={`<Input name='cpf' type='cpf' title='CPF' />`} />
                    </Grid>

                    <Input name='cep' type='cep' title='CEP' />
                    <Grid size={12}>
                        <Source code={`<Input name='cep' type='cep' title='CEP' />`} />
                    </Grid>

                    <Input name='cnpj' type='cnpj' title='CNPJ' />
                    <Grid size={12}>
                        <Source code={`<Input name='cnpj' type='cnpj' title='CNPJ' />`} />
                    </Grid>

                    <Input name='cpf_cnpj' type='cpf_cnpj' title='CPF ou CNPJ' />
                    <Grid size={12}>
                        <Source code={`<Input name='cpf_cnpj' type='cpf_cnpj' title='CPF ou CNPJ' />`} />
                    </Grid>

                    <Input name='email' type='email' title='Email' />
                    <Grid size={12}>
                        <Source code={`<Input name='email' type='email' title='Email' />`} />
                    </Grid>

                    <Input name='password' type='password' title='Password' />
                    <Grid size={12}>
                        <Source code={`<Input name='password' type='password' title='Password' />`} />
                    </Grid>

                    {/* Botão de enviar sempre do tipo submit */}
                    <Button type='submit' variant='contained'>
                        Enviar
                    </Button>

                    <Grid size={12}>
                        <h2>Dados:</h2>
                        {JSON.stringify(dados, null, 4)}
                    </Grid>
                </Grid>
            </FormProvider>
        </SspComponentsProvider>
    );
}
