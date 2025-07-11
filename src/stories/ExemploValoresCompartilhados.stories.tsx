import { Button, Grid } from '@mui/material'
import { Source } from '@storybook/addon-docs/blocks'
import { Meta, StoryObj } from '@storybook/react-webpack5'
import { useContext, useState } from 'react'
import 'react-toastify/ReactToastify.min.css'
import Input from '../components/form/input/Input'
import FormProvider from '../components/providers/FormProvider'
import { SspComponentsProvider } from '../components/providers/SspComponentsProvider'
import { FormContext } from '../context/form'

const meta: Meta<typeof Teste> = {
    title: 'Exemplo/Assistir valor do form',
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
                    <Grid item xs={12}>
                        <Source
                            code={`
<Input name='nome' type='input' title='Nome' required />

<NomeComponent />


// criando um component apenas para acessar o context
// lembre-se que só dá para acessar o context de dentro da árvore (filho do FormProvider)
function NomeComponent() {
    const context = useContext(FormContext)!

    // Usando formWatch para assistir um valor do form (FUNCIONA APENAS PARA MOSTRAR)
    return (
        <Grid item xs={12}>
            <h3>Nome: {context.formWatch('nome')}</h3>
        </Grid>
    )
}
`}
                        />
                    </Grid>

                    <NomeComponent />

                    {/* Botão de enviar sempre do tipo submit */}
                    <Button type='submit' variant='contained'>
                        Enviar
                    </Button>
                </Grid>
            </FormProvider>
        </SspComponentsProvider>
    )
}

function NomeComponent() {
    const context = useContext(FormContext)!

    return (
        <Grid item xs={12}>
            <h3>Nome: {context.formWatch('nome')}</h3>
        </Grid>
    )
}
