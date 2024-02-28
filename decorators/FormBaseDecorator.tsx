import { Button, Stack } from '@mui/material'
import React from 'react'
import { QueryClient, QueryClientProvider } from 'react-query'
import { FormProvider, Stepper, StepperBlock } from '../src'
import { SspComponentsProvider } from '../src/components/providers/SspComponentsProvider'

const client = new QueryClient()

export default function FormBaseDecorator(Story: any, el: any) {
    return (
        <SspComponentsProvider>
            <FormProvider onSubmit={(d, files) => console.log(d, files)}>
                <QueryClientProvider client={client}>
                    <Stack spacing={2}>
                        {/* <Stepper> */}
                        {/* <StepperBlock title='Teste'> */}
                        <Story />
                        {/* </StepperBlock> */}
                        {/* </Stepper> */}
                    </Stack>
                </QueryClientProvider>
            </FormProvider>
        </SspComponentsProvider>
    )
}
