import { Meta, StoryObj } from '@storybook/nextjs'
import FormBaseDecorator from '../decorators/FormBaseDecorator'
import GenericFormBaseDecorator from '../decorators/GenericFormBaseDecorator'
import Input from '../components/form/input/Input'
import GenericInput from '../components/form/input/GenericInput'
import FetchAutoComplete from '../components/form/input/FetchAutoComplete'
import GenericFetchAutoComplete from '../components/form/input/GenericFetchAutoComplete'
import { FixedAutoComplete } from '../components/form/input/FixedAutoComplete'
import DatePicker from '../components/form/date/DatePicker'
import GenericDatePicker from '../components/form/date/GenericDatePicker'
import TimePicker from '../components/form/date/TimePicker'
import MultInput from '../components/form/input/MultInput'
import GenericMultInput from '../components/form/input/GenericMultInput'
import { Radio } from '../components/form/radio/Radio'
import opcoes from '../../public/mock-api/autocomplete.json'
import { esperarErroDeValidacao } from './interacao'

/**
 * Cada campo obrigatório depois de um envio vazio: o visual do estado de erro (borda, texto de
 * ajuda com fundo e ícone). Os snapshots das outras stories só veem o estado inicial, e é aqui que
 * a troca de `FormHelperTextProps` por `slotProps` (MUI 7+) e os estilos dos pickers (x-date-pickers
 * 8+) poderiam regredir sem erro. O `play` envia o formulário; o PNG sai depois dele. O toast de
 * "formulário incompleto" fica escondido na captura (tem tempo de vida).
 */
const meta: Meta = {
    title: 'Estados de erro',
    tags: ['erro-visual'],
}

export default meta
type Story = StoryObj

const enviarVazio = async ({ canvasElement }: { canvasElement: HTMLElement }) => {
    // requestSubmit, e não um clique no botão: sem o ripple do botão na captura.
    canvasElement.querySelector('form')!.requestSubmit()
    await esperarErroDeValidacao(canvasElement)
}

export const Input_: Story = { name: 'Input', decorators: [FormBaseDecorator], render: () => <Input name='cpf' title='CPF' type='cpf' required />, play: enviarVazio }
export const GenericInput_: Story = {
    name: 'GenericInput',
    decorators: [GenericFormBaseDecorator],
    render: () => <GenericInput name='cpf' title='CPF' type='cpf' required />,
    play: enviarVazio,
}
export const FetchAutoComplete_: Story = {
    name: 'FetchAutoComplete',
    decorators: [FormBaseDecorator],
    render: () => <FetchAutoComplete name='conseg' title='Conseg' url='/mock-api/autocomplete.json' required />,
    play: enviarVazio,
}
export const GenericFetchAutoComplete_: Story = {
    name: 'GenericFetchAutoComplete',
    decorators: [GenericFormBaseDecorator],
    render: () => <GenericFetchAutoComplete name='conseg' title='Conseg' url='/mock-api/autocomplete.json' required />,
    play: enviarVazio,
}
export const FixedAutoComplete_: Story = {
    name: 'FixedAutoComplete',
    decorators: [FormBaseDecorator],
    render: () => <FixedAutoComplete name='conseg' title='Conseg' list={opcoes} required />,
    play: enviarVazio,
}
export const DatePicker_: Story = { name: 'DatePicker', decorators: [FormBaseDecorator], render: () => <DatePicker name='data' title='Data' required />, play: enviarVazio }
export const GenericDatePicker_: Story = {
    name: 'GenericDatePicker',
    decorators: [GenericFormBaseDecorator],
    render: () => <GenericDatePicker name='data' title='Data' required />,
    play: enviarVazio,
}
export const TimePicker_: Story = { name: 'TimePicker', decorators: [FormBaseDecorator], render: () => <TimePicker name='hora' title='Hora' required />, play: enviarVazio }
export const MultInput_: Story = { name: 'MultInput', decorators: [FormBaseDecorator], render: () => <MultInput name='relato' title='Relato' required />, play: enviarVazio }
export const GenericMultInput_: Story = {
    name: 'GenericMultInput',
    decorators: [GenericFormBaseDecorator],
    render: () => <GenericMultInput name='relato' title='Relato' required />,
    play: enviarVazio,
}
export const Radio_: Story = {
    name: 'Radio',
    decorators: [FormBaseDecorator],
    render: () => (
        <Radio
            name='opcao'
            title='Escolha uma opção'
            required
            options={[
                { label: 'Opção 1', value: 'op1' },
                { label: 'Opção 2', value: 'op2' },
            ]}
        />
    ),
    play: enviarVazio,
}
