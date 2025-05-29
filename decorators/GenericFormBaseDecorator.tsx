import { Button, Stack, Typography } from '@mui/material'
import { useState } from 'react'
import { FieldValues } from 'react-hook-form'
import { QueryClient, QueryClientProvider } from 'react-query'
import { ToastContainer } from 'react-toastify'
import GenericFormProvider from '../src/components/providers/GenericFormProvider'
import { SspComponentsProvider } from '../src/components/providers/SspComponentsProvider'

const client = new QueryClient()

export default function GenericFormBaseDecorator(Story: any, el: any) {
    const [formData, setFormData] = useState<FieldValues>()
    return (
        <>
            <ToastContainer />
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
        </>
    )
}
