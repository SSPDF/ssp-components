import { Grid } from '@mui/material'
import { Meta, StoryObj } from '@storybook/nextjs'
import { expect, within } from 'storybook/test'
import DatePicker from '../components/form/date/DatePicker'
import GenericDatePicker from '../components/form/date/GenericDatePicker'
import TimePicker from '../components/form/date/TimePicker'
import AutoComplete from '../components/form/input/AutoComplete'
import FetchAutoComplete from '../components/form/input/FetchAutoComplete'
import { FixedAutoComplete } from '../components/form/input/FixedAutoComplete'
import GenericFetchAutoComplete from '../components/form/input/GenericFetchAutoComplete'
import Input from '../components/form/input/Input'
import FormBaseDecorator from '../decorators/FormBaseDecorator'
import GenericFormBaseDecorator from '../decorators/GenericFormBaseDecorator'

/**
 * Cada campo é achado pelo nome que o leitor de tela anuncia, e esse nome é o título do campo.
 * Até a `1.0.0-rc.2` o `InputLabel` ficava solto, sem ligação com o campo, e o campo só tinha
 * placeholder (UPGRADE_PLAN.md 5.21b). Os testes dos apps podem usar `getByRole(…, { name })`.
 */
const meta: Meta = {
    title: 'Acessibilidade/Nomes dos campos',
}

export default meta
type Story = StoryObj

const opcoes = [
    { id: 1, label: 'Asa Norte' },
    { id: 2, label: 'Gama' },
]

export const InteracaoFormProvider: Story = {
    tags: ['interacao'],
    decorators: [FormBaseDecorator],
    render: () => (
        <Grid container spacing={2}>
            <Input name='nome' title='Nome completo' />
            <Input name='cpf' title='CPF' type='cpf' />
            <FixedAutoComplete name='regiao' title='Região' list={opcoes} />
            <AutoComplete name='conseg' title='Conseg' url='/mock-api/autocomplete.json' />
            <FetchAutoComplete name='conseg2' title='Outro Conseg' url='/mock-api/autocomplete.json' />
            <DatePicker name='nascimento' title='Data de nascimento' />
            <TimePicker name='hora' title='Hora do fato' />
        </Grid>
    ),
    play: async ({ canvasElement }) => {
        const canvas = within(canvasElement)
        await expect(canvas.getByRole('textbox', { name: 'Nome completo' })).toBeInTheDocument()
        // Com máscara (react-imask), o id tem que chegar ao <input> de dentro do MaskInput.
        await expect(canvas.getByRole('textbox', { name: 'CPF' })).toBeInTheDocument()
        await expect(canvas.getByRole('combobox', { name: 'Região' })).toBeInTheDocument()
        await expect(await canvas.findByRole('combobox', { name: 'Conseg' })).toBeInTheDocument()
        await expect(await canvas.findByRole('combobox', { name: 'Outro Conseg' })).toBeInTheDocument()
        await expect(canvas.getByRole('group', { name: 'Data de nascimento' })).toBeInTheDocument()
        await expect(canvas.getByRole('group', { name: 'Hora do fato' })).toBeInTheDocument()
    },
}

export const InteracaoGenericFormProvider: Story = {
    tags: ['interacao'],
    decorators: [GenericFormBaseDecorator],
    render: () => (
        <Grid container spacing={2}>
            <GenericFetchAutoComplete name='conseg' title='Conseg' url='/mock-api/autocomplete.json' />
            <GenericDatePicker name='nascimento' title='Data de nascimento' />
        </Grid>
    ),
    play: async ({ canvasElement }) => {
        const canvas = within(canvasElement)
        await expect(await canvas.findByRole('combobox', { name: 'Conseg' })).toBeInTheDocument()
        await expect(canvas.getByRole('group', { name: 'Data de nascimento' })).toBeInTheDocument()
    },
}
