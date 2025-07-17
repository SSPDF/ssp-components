import { Button, Grid } from '@mui/material'
import { Source } from '@storybook/addon-docs/blocks'
import { Meta, StoryObj } from '@storybook/nextjs'
import { useContext, useState } from 'react'
import 'react-toastify/ReactToastify.min.css'
import Input from '../components/form/input/Input'
import MultInput from '../components/form/input/MultInput'
import FormProvider from '../components/providers/FormProvider'
import { SspComponentsProvider } from '../components/providers/SspComponentsProvider'
import { FormContext } from '../context/form'

const meta: Meta<typeof Teste> = {
    title: 'Exemplo/Input -> Input',
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
                    <MensagemInput />
                    <Grid item xs={12}>
                        <Source
                            code={`
<Input name='nome' type='input' title='Nome' required />

<NomeComponent />


// criando um component apenas para acessar o context
// lembre-se que só dá para acessar o context de dentro da árvore (filho do FormProvider)
function MensagemInput() {
    const context = useContext(FormContext)!

    return <MultInput name='mensagem' title='Mensagem' watchValue={\`Olá, \${context.formWatch('nome')}\`} />
}
`}
                        />
                    </Grid>

                    {/* Botão de enviar sempre do tipo submit */}
                    <Button type='submit' variant='contained'>
                        Enviar
                    </Button>
                </Grid>
            </FormProvider>
        </SspComponentsProvider>
    )
}

function MensagemInput() {
    const context = useContext(FormContext)!

    return <MultInput name='mensagem' title='Mensagem' watchValue={`Olá, ${context.formWatch('nome')}`} />
}
