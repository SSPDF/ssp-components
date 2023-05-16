import { LoadingButton } from '@mui/lab'
import { Stack } from '@mui/material'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Container from '@mui/material/Container'
import Typography from '@mui/material/Typography'
import { useRouter } from 'next/router'
import * as React from 'react'
import { useState } from 'react'
import FormProvider from '../providers/FormProvider'

export function Login({
    imgURL = '',
    name = 'Login',
    fields,
    loginURL,
    onSuccess,
    onFail,
}: {
    imgURL?: string
    loginURL: string
    fields: JSX.Element | JSX.Element[]
    name?: string
    onSuccess: () => void
    onFail: () => void
}) {
    const [loading, setLoading] = useState(false)

    function login(data: any) {
        fetch(loginURL, {
            method: 'POST',
            body: JSON.stringify({
                ...data,
                cpf: (data.cpf as any).replaceAll(/[.-]/g, ''),
            }),
            headers: {
                'Content-Type': 'application/json',
            },
        }).then((res) => {
            if (res.ok) onSuccess()
            return onFail()
        })
    }

    return (
        <FormProvider onSubmit={login}>
            <Container component='main' maxWidth='xs'>
                <Box
                    sx={{
                        marginTop: 8,
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                    }}
                >
                    {imgURL && <img src={imgURL} alt='' height={100} width={100} />}
                    <Typography component='h1' variant='h5' paddingY={3}>
                        {name}
                    </Typography>
                    <Stack spacing={3} width={300}>
                        <Stack spacing={1}>{fields}</Stack>
                        <LoadingButton type='submit' fullWidth variant='contained' loading={loading}>
                            Login
                        </LoadingButton>
                    </Stack>
                </Box>
            </Container>
        </FormProvider>
    )
}
