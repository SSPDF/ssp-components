import { Button, Stack, Typography } from '@mui/material'
import React, { useState } from 'react'
import { QueryClient, QueryClientProvider } from 'react-query'
import { FormProvider } from '../src'
import { SspComponentsProvider } from '../src/components/providers/SspComponentsProvider'

import '../css/ReactToastify.css'
import { FieldValues } from 'react-hook-form'
import GenericFormProvider from '../src/components/providers/GenericFormProvider'

const client = new QueryClient()

export default function GenericFormBaseDecorator(Story: any, el: any) {
    const [formData, setFormData] = useState<FieldValues>()
    return (
        <SspComponentsProvider>
            <GenericFormProvider
                onSubmit={(d) => {
                    console.log(d)
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
            </GenericFormProvider>
        </SspComponentsProvider>
    )
}
