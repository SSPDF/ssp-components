import { Meta, StoryObj } from '@storybook/react-webpack5'
import StepperBlock from '../components/form/stepper/StepperBlock'
import FormBaseDecorator from '../decorators/FormBaseDecorator'

const meta: Meta<typeof StepperBlock> = {
    title: 'Stepper/StepperBlock',
    component: StepperBlock,
    tags: ['autodocs'],
    decorators: [FormBaseDecorator],
}

export default meta
type Story = StoryObj<typeof StepperBlock>

export const Base: Story = {
    args: {
        title: 'Titulo do formulario',
        optional: true,
    },
}
