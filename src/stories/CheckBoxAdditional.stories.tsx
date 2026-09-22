import { Meta, StoryObj } from '@storybook/nextjs'
import { Alert } from '@mui/material'
import CheckBoxAdditional from '../components/form/checkbox/CheckBoxAdditional'
import CheckBox from '../components/form/checkbox/CheckBox'
import FormBaseDecorator from '../decorators/FormBaseDecorator'

/**
 * `CheckBoxAdditional` envolve um checkbox e revela um conteúdo extra (`content`)
 * depois da primeira tentativa de envio sem seleção.
 */
const meta: Meta<typeof CheckBoxAdditional> = {
    title: 'CheckBox/CheckBoxAdditional',
    component: CheckBoxAdditional,
    tags: ['autodocs'],
    decorators: [FormBaseDecorator],
}

export default meta
type Story = StoryObj<typeof CheckBoxAdditional>

export const Base: Story = {
    args: {
        name: 'checkBoxAdditional',
        nameList: ['aceiteTermos'],
        children: <CheckBox name='aceiteTermos' title='Li e aceito os termos' />,
        content: <Alert severity='info'>É necessário aceitar os termos para prosseguir.</Alert>,
    },
}

export const ComTextoCustomizado: Story = {
    args: {
        name: 'checkBoxAdditionalCustom',
        nameList: ['aceiteCustom'],
        customText: 'Marque a opção para continuar',
        children: <CheckBox name='aceiteCustom' title='Autorizo o uso dos meus dados' />,
        content: <Alert severity='warning'>Marque a opção para continuar.</Alert>,
    },
}
