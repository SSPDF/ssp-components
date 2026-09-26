import { Button, Stack, Typography } from '@mui/material'
import { useState } from 'react'
import { FieldValues } from 'react-hook-form'
import GenericFormProvider from '../components/providers/GenericFormProvider'
import { SspComponentsProvider } from '../components/providers/SspComponentsProvider'
import '../css/ReactToastify.css'

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
                <Stack spacing={2}>
                    <Story />
                    <Button type='submit'>Enviar</Button>
                    {!!formData && <Typography data-testid='dados-enviados'>{JSON.stringify(formData)}</Typography>}
                </Stack>
            </GenericFormProvider>
        </SspComponentsProvider>
    )
}
