import { Button, Stack, Typography } from '@mui/material'
import { useState } from 'react'
import { FieldValues } from 'react-hook-form'
import { FormProvider } from '../'
import { SspComponentsProvider } from '../components/providers/SspComponentsProvider'
import '../css/ReactToastify.css'

export default function FormBaseDecorator(Story: any, el: any) {
    const [formData, setFormData] = useState<FieldValues>()
    const [filesUid, setFilesUid] = useState<unknown[]>([])
    return (
        <SspComponentsProvider>
            <FormProvider
                onSubmit={(d, files) => {
                    console.log(d, files)
                    setFormData(d)
                    setFilesUid(files)
                }}
            >
                <Stack spacing={2}>
                    <Story />
                    <Button type='submit'>Enviar</Button>
                    {!!formData && <Typography data-testid='dados-enviados'>{JSON.stringify(formData)}</Typography>}
                    {!!formData && filesUid.length > 0 && <Typography data-testid='arquivos-enviados'>{JSON.stringify(filesUid)}</Typography>}
                </Stack>
            </FormProvider>
        </SspComponentsProvider>
    )
}
