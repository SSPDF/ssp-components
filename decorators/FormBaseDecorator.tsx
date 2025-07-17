import { Button, Stack, Typography } from '@mui/material'
import React, { useState } from 'react'
import { QueryClient, QueryClientProvider } from 'react-query'
import { FormProvider } from '../src'
import { SspComponentsProvider } from '../src/components/providers/SspComponentsProvider'

import '../css/ReactToastify.css'
import { FieldValues } from 'react-hook-form'

const client = new QueryClient()

export default function FormBaseDecorator(Story: any, el: any) {
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
                        <Story />
                        <Button type='submit'>Enviar</Button>
                        {!!formData && <Typography>{JSON.stringify(formData)}</Typography>}
                    </Stack>
                </QueryClientProvider>
            </FormProvider>
        </SspComponentsProvider>
    )
}
