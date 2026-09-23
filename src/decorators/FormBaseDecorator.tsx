import { Button, Stack, Typography } from '@mui/material'
import { useState } from 'react'
import { FieldValues } from 'react-hook-form'
import { FormProvider } from '../'
import { SspComponentsProvider } from '../components/providers/SspComponentsProvider'
import '../css/ReactToastify.css'

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
                <Stack spacing={2}>
                    <Story />
                    <Button type='submit'>Enviar</Button>
                    {!!formData && <Typography>{JSON.stringify(formData)}</Typography>}
                </Stack>
            </FormProvider>
        </SspComponentsProvider>
    )
}
