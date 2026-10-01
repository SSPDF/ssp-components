import { Box, Grid, ThemeProvider, createTheme } from '@mui/material'
import { Meta, StoryObj } from '@storybook/nextjs'
import FormBaseDecorator from '../decorators/FormBaseDecorator'
import Input from '../components/form/input/Input'
import DatePicker from '../components/form/date/DatePicker'
import TimePicker from '../components/form/date/TimePicker'
import { FixedAutoComplete } from '../components/form/input/FixedAutoComplete'
import CheckBox from '../components/form/checkbox/CheckBox'
import { Radio } from '../components/form/radio/Radio'
import Table from '../components/form/table/Table'
import opcoes from '../../public/mock-api/autocomplete.json'

/**
 * Os componentes sob um tema escuro do app (`palette.mode: 'dark'`). No tema claro as cores neutras
 * da lib são fixas, como sempre foram; no escuro vêm da paleta do tema (`form/fieldBorder.ts` e
 * `utils/useThemedColor.ts`). Sem estas stories nada no repositório renderiza em tema escuro, e um
 * `'white'` fixo novo num campo passaria despercebido: o texto herda a cor clara do tema e some.
 */
const meta: Meta = {
    title: 'Tema escuro',
}

export default meta
type Story = StoryObj

const temaEscuro = createTheme({ palette: { mode: 'dark' } })

// Último da lista = mais externo: o tema envolve também o formulário do FormBaseDecorator.
const ComTemaEscuro = (Story: any) => (
    <ThemeProvider theme={temaEscuro}>
        <Box sx={{ bgcolor: 'background.default', color: 'text.primary', p: 2 }}>
            <Story />
        </Box>
    </ThemeProvider>
)

export const Campos: Story = {
    decorators: [FormBaseDecorator, ComTemaEscuro],
    render: () => (
        <Grid container spacing={2}>
            <Input name='nome' title='Nome' xs={12} md={6} />
            <Input name='cpf' title='CPF' type='cpf' required xs={12} md={6} />
            <DatePicker name='data' title='Data' xs={12} md={6} />
            <TimePicker name='hora' title='Hora' xs={12} md={6} />
            <FixedAutoComplete name='conseg' title='Conseg' list={opcoes} xs={12} md={6} />
            <CheckBox name='aceite' title='Li e aceito' xs={12} md={6} />
            <Radio
                name='opcao'
                title='Escolha uma opção'
                options={[
                    { label: 'Opção 1', value: 'op1' },
                    { label: 'Opção 2', value: 'op2' },
                ]}
            />
        </Grid>
    ),
}

export const Tabela: Story = {
    decorators: [FormBaseDecorator, ComTemaEscuro],
    render: () => (
        <Table
            id='tema-escuro'
            tableName='itens'
            useKC={false}
            columnSize={6}
            initialData={[
                { id: '1234', name: 'Pedro Matias', status: 'ATIVO' },
                { id: '9876', name: 'Jose Afonso', status: 'INATIVO' },
                { id: '4567', name: 'Maria Clara', status: 'ATIVO' },
            ]}
            columns={[
                { keyName: 'id', title: 'id' },
                { keyName: 'name', title: 'Nome' },
                { keyName: 'status', title: 'Status' },
            ]}
            action={() => <></>}
        />
    ),
}
