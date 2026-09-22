import { Meta, StoryObj } from '@storybook/nextjs'
import RequiredCheckBoxGroup from '../components/form/checkbox/RequiredCheckBoxValidator'
import CheckBox from '../components/form/checkbox/CheckBox'
import FormBaseDecorator from '../decorators/FormBaseDecorator'

/**
 * Valida que ao menos um dos checkboxes filhos esteja marcado. Envie o formulário
 * sem marcar nada para ver a borda vermelha e a mensagem de erro.
 */
const meta: Meta<typeof RequiredCheckBoxGroup> = {
    title: 'CheckBox/RequiredCheckBoxGroup',
    component: RequiredCheckBoxGroup,
    tags: ['autodocs'],
    decorators: [FormBaseDecorator],
}

export default meta
type Story = StoryObj<typeof RequiredCheckBoxGroup>

export const Base: Story = {
    args: {
        name: 'meiosContato',
        children: [
            <CheckBox key='email' name='contatoEmail' title='E-mail' />,
            <CheckBox key='tel' name='contatoTelefone' title='Telefone' />,
            <CheckBox key='pres' name='contatoPresencial' title='Presencial' />,
        ],
    },
}

export const ComTextoCustomizado: Story = {
    args: {
        name: 'meiosContatoCustom',
        customText: 'Escolha pelo menos uma forma de contato',
        children: [<CheckBox key='email' name='contatoEmail2' title='E-mail' />, <CheckBox key='tel' name='contatoTelefone2' title='Telefone' />],
    },
}

export const FilhoUnico: Story = {
    args: {
        name: 'aceiteUnico',
        children: <CheckBox name='aceiteUnicoValor' title='Declaro que as informações são verdadeiras' />,
    },
}
