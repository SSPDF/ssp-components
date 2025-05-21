import { Button, Stack, Typography } from '@mui/material'
import React, { useState } from 'react'
import { QueryClient, QueryClientProvider } from 'react-query'
import { FormProvider } from '../src'
import { SspComponentsProvider } from '../src/components/providers/SspComponentsProvider'

import '../src/css/ReactToastify.css'
import { FieldValues } from 'react-hook-form'
import { Stepper } from '../src/components/form/stepper/Stepper'

const client = new QueryClient()

export default function StepperDecorator(Story: any, el: any) {
    const [formData, setFormData] = useState<FieldValues>()
    return (
        <SspComponentsProvider>
            <FormProvider
                onSubmit={(d, files) => {
                    console.log(d, files)
                    setFormData(d)
                }}
            >
                <QueryClientProvider client={client}>
                    <Stack spacing={2}>
                        {/* <Stepper> */}
                        <Story />
                        <Button type='submit'>Enviar</Button>
                        {!!formData && <Typography>{JSON.stringify(formData)}</Typography>}
                        {/* </Stepper> */}
                    </Stack>
                </QueryClientProvider>
            </FormProvider>
        </SspComponentsProvider>
    )
}
