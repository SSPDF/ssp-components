import { Meta, StoryObj } from '@storybook/react'
import React from 'react'
import { CheckBox, CheckBoxWarning, DatePicker, FetchAutoComplete, FileUpload, MultInput, Switch, SwitchWatch, TimePicker, ToggleVisibility } from '..'
import FormBaseDecorator from '../../decorators/FormBaseDecorator'
import { Input } from '../components/form/input/Input'
import Stepper from '../components/form/stepper/Stepper'
import { StepperBlock } from '../components/form/stepper/StepperBlock'
import { Box, Typography } from '@mui/material'

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
                <Box>
                    Teste
                    <Box>Teste</Box>
                    <Typography>Teste</Typography>
                </Box>
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
                {/* <Input type='input' name='teste1' /> */}
                {/* <FetchAutoComplete name='fetchAL' title='Teste' url='http://localhost:7171/autocomplete' customLoadingText='Carregando...' required /> */}

                <FileUpload apiURL='http://localhost:3000/file' name='arq' tipoArquivo='19' title='Teste' />
                {/* <Switch name='ata' defaultChecked={true} />
                <SwitchWatch switchId='0.ata' unregisterNameList={['0.teste1']}>
                    <FileUpload apiURL='http://localhost:3000/files' name='arq' tipoArquivo='3' title='Teste' required />
                </SwitchWatch> */}
            </StepperBlock>
            <StepperBlock title='Segundo bloco'>
                <Box>Teste</Box>
                <Box>Teste</Box>
                <Input name='segundo' type='input' customPlaceholder='Segundo' />
            </StepperBlock>
        </Stepper>
    ),
}
