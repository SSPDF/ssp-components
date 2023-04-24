import { Stack } from '@mui/material'
import React from 'react'
import { QueryClient, QueryClientProvider } from 'react-query'
import { FormProvider } from '../src'

const client = new QueryClient()

export default function FormBaseDecorator(Story: any, el: any) {
    return (
        <FormProvider onSubmit={(d) => console.log(d)}>
            <QueryClientProvider client={client}>
                <Stack spacing={2}>
                    <Story />
                </Stack>
            </QueryClientProvider>
        </FormProvider>
    )
}
