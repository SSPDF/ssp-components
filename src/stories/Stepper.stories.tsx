import { Stack, Typography } from '@mui/material'
import { Meta, StoryObj } from '@storybook/nextjs'
import Stepper from '../components/form/stepper/Stepper'
import StepperBlock from '../components/form/stepper/StepperBlock'
import StepperDecorator from '../decorators/StepperDecorator'
import { expect, userEvent, within } from 'storybook/test'

const meta: Meta<typeof Stepper> = {
    title: 'Stepper/Stepper',
    component: Stepper,
    tags: ['autodocs'],
    decorators: [StepperDecorator],
}

export default meta
type Story = StoryObj<typeof Stepper>

export const Base: Story = {
    args: {
        debugLog: true,
    },
    render: (args) => (
        <Stepper {...args}>
            <StepperBlock title='Step 1'>
                <Stack spacing={2} alignItems={'center'} width={'100%'} py={8}>
                    <Typography variant='body1'>This is content for Step 1</Typography>
                </Stack>
            </StepperBlock>
            <StepperBlock title='Step 2'>
                <Stack spacing={2} alignItems={'center'} width={'100%'} py={8}>
                    <Typography variant='body1'>This is content for Step 2</Typography>
                </Stack>
            </StepperBlock>
        </Stepper>
    ),
}

/** Avança e volta entre os passos; os botões habilitam conforme a posição. */
export const Interacao: Story = {
    tags: ['interacao'],
    args: Base.args,
    render: Base.render,
    play: async ({ canvasElement }) => {
        const canvas = within(canvasElement)
        await expect(canvas.getByRole('button', { name: 'Voltar' })).toBeDisabled()

        await userEvent.click(canvas.getByRole('button', { name: 'Próximo' }))
        await expect(await canvas.findByRole('heading', { name: 'Step 2' })).toBeVisible()
        await expect(canvas.getByText('2 / 2')).toBeVisible()

        await userEvent.click(canvas.getByRole('button', { name: 'Voltar' }))
        await expect(await canvas.findByRole('heading', { name: 'Step 1' })).toBeVisible()
    },
}
