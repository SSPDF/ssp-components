import { CssBaseline, Grid, ThemeProvider, Typography, createTheme } from '@mui/material'
import { Meta, StoryObj } from '@storybook/nextjs'
import FormBaseDecorator from '../decorators/FormBaseDecorator'
import Input from '../components/form/input/Input'
import MultInput from '../components/form/input/MultInput'
import OptionalInput from '../components/form/input/OptionalInput'
import OtherCheckBox from '../components/form/input/OtherCheckBox'
import DatePicker from '../components/form/date/DatePicker'
import TimePicker from '../components/form/date/TimePicker'
import { FixedAutoComplete } from '../components/form/input/FixedAutoComplete'
import CheckBox from '../components/form/checkbox/CheckBox'
import CheckBoxWarning from '../components/form/checkbox/CheckBoxWarning'
import { Radio } from '../components/form/radio/Radio'
import Table from '../components/form/table/Table'
import opcoes from '../../public/mock-api/autocomplete.json'

/**
 * Os outros dois jeitos de um app ter tema escuro no MUI 9, além do que o resto do Storybook usa
 * (`colorSchemes` + `cssVariables`, no global `tema` — ver src/decorators/TemaDecorator.tsx):
 *
 * - `palette: { mode: 'dark' }`: o app inteiro escuro, sem troca;
 * - `colorSchemes` **sem** `cssVariables`: o `ThemeProvider` troca o tema inteiro ao mudar de modo.
 *
 * Nos dois, `theme.applyStyles('dark', …)` devolve os estilos direto (sem seletor), então é outro
 * caminho do código que o global não exercita. Estas stories montam o próprio tema (tag
 * `tema-proprio`, que o `TemaDecorator` não envolve) e seguem o global `tema` do mesmo jeito: no
 * claro, o mesmo mecanismo em modo claro, que é a referência da verificação de legibilidade; no
 * escuro, o modo escuro.
 */
const meta: Meta = {
    title: 'Tema escuro',
    tags: ['tema-proprio'],
}

export default meta
type Story = StoryObj

const paletteMode = { claro: createTheme(), escuro: createTheme({ palette: { mode: 'dark' } }) }
const semVariaveis = createTheme({ colorSchemes: { light: true, dark: true } })

// Último da lista = mais externo: o tema envolve também o formulário do FormBaseDecorator.
const comPaletteMode = (Story: any, { globals }: any) => (
    <ThemeProvider theme={globals.tema === 'escuro' ? paletteMode.escuro : paletteMode.claro}>
        <CssBaseline />
        <Story />
    </ThemeProvider>
)
const comColorSchemesSemVariaveis = (Story: any, { globals }: any) => (
    // `key`: o modo inicial só é lido na montagem.
    <ThemeProvider key={globals.tema} theme={semVariaveis} defaultMode={globals.tema === 'escuro' ? 'dark' : 'light'} storageManager={null}>
        <CssBaseline />
        <Story />
    </ThemeProvider>
)

const Campos = () => (
    <Grid container spacing={2}>
        <Input name='nome' title='Nome' xs={12} md={6} defaultValue='Maria Clara' />
        <Input name='cpf' title='CPF' type='cpf' required xs={12} md={6} />
        <DatePicker name='data' title='Data' xs={12} md={6} />
        <TimePicker name='hora' title='Hora' xs={12} md={6} />
        <FixedAutoComplete name='conseg' title='Conseg' list={opcoes} xs={12} md={6} />
        <MultInput name='obs' title='Observações' xs={12} md={6} />
        <OptionalInput name='apelido' title='Apelido' xs={12} md={6} />
        <CheckBox name='aceite' title='Li e aceito' xs={12} md={6} />
        <CheckBoxWarning name='aviso' title='Ciente do aviso' customWarning={<Typography>Texto do aviso</Typography>} xs={12} md={6} />
        <OtherCheckBox name='outro' xs={12} md={6} />
        <Radio
            name='opcao'
            title='Escolha uma opção'
            options={[
                { label: 'Opção 1', value: 'op1' },
                { label: 'Opção 2', value: 'op2' },
            ]}
        />
    </Grid>
)

const Tabela = () => (
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
)

export const CamposPaletteMode: Story = { name: 'Campos (palette.mode)', decorators: [FormBaseDecorator, comPaletteMode], render: Campos }
export const TabelaPaletteMode: Story = { name: 'Tabela (palette.mode)', decorators: [FormBaseDecorator, comPaletteMode], render: Tabela }
export const CamposSemVariaveis: Story = { name: 'Campos (colorSchemes sem variáveis CSS)', decorators: [FormBaseDecorator, comColorSchemesSemVariaveis], render: Campos }
export const TabelaSemVariaveis: Story = { name: 'Tabela (colorSchemes sem variáveis CSS)', decorators: [FormBaseDecorator, comColorSchemesSemVariaveis], render: Tabela }
