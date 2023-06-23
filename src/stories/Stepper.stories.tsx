import { Meta, StoryObj } from '@storybook/react'
import React from 'react'
import { CheckBox, CheckBoxWarning, DatePicker, FetchAutoComplete, MultInput, Switch, SwitchWatch, TimePicker, ToggleVisibility } from '..'
import FormBaseDecorator from '../../decorators/FormBaseDecorator'
import { Input } from '../components/form/input/Input'
import Stepper from '../components/form/stepper/Stepper'
import { StepperBlock } from '../components/form/stepper/StepperBlock'

const meta: Meta<typeof Stepper> = {
    title: 'Stepper/Stepper',
    component: Stepper,
    tags: ['autodocs'],
    decorators: [FormBaseDecorator],
}

export default meta
type Story = StoryObj<typeof Stepper>

export const Base: Story = {
    args: {
        debugLog: true,
    },
    render: (args) => (
        <Stepper {...args}>
            <StepperBlock title='Primeiro bloco'>
                {/* <DatePicker name='dt' title='Teste' defaultValue='10/05/2023' /> */}
                {/* <Input type='input' name='teste1' defaultValue='Teste' required />
                <Input type='number' name='teste2' defaultValue='5666' required />
                <Input type='cpf' name='teste3' defaultValue='05513229162' required />
                <Input type='cep' name='teste4' defaultValue='70846120' required />
                <MultInput name='dt3' defaultValue='Teste de minput multiplo' />
                <CheckBox name='tcheck' title='Meu checkbox' defaultValue={true} />
                <CheckBoxWarning name='tcheck2' title='Check Warning' defaultValue={true} />
                <DatePicker name='dt' defaultValue='10/08/2023' />
                <TimePicker name='dt2' defaultValue='10:23' />*/}
                <Input type='input' name='teste1' />
                <FetchAutoComplete name='fetchAL' title='Teste' url='http://localhost:7171/autocomplete' customLoadingText='Carregando...' required />
                {/* <Switch name='ata' />
                <SwitchWatch switchId='0.fetchAL' unregisterNameList={['0.teste1']}>
                </SwitchWatch> */}
            </StepperBlock>
            <StepperBlock title='Segundo bloco' optional>
                <Input name='segundo' type='input' customPlaceholder='Segundo' />
            </StepperBlock>
        </Stepper>
    ),
}
