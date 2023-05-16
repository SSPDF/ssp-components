import { LoadingButton } from '@mui/lab'
import { Stack } from '@mui/material'
import Box from '@mui/material/Box'
import Container from '@mui/material/Container'
import Typography from '@mui/material/Typography'
import * as React from 'react'
import { useContext, useState } from 'react'
import FormProvider from '../providers/FormProvider'
import { AuthContext } from '../../context/auth'

export function Login({
    imgURL = '',
    name = 'Login',
    children,
    loginURL,
    onSuccess,
    onFail,
}: {
    imgURL?: string
    loginURL: string
    children: JSX.Element | JSX.Element[]
    name?: string
    onSuccess: () => void
    onFail: () => void
}) {
    const [loading, setLoading] = useState(false)
    const { adLogin } = useContext(AuthContext)

    function onLogin(data: any) {
        adLogin(loginURL, data)
    }

    return (
        <FormProvider onSubmit={onLogin}>
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
                        <Stack spacing={1}>{children}</Stack>
                        <LoadingButton type='submit' fullWidth variant='contained' loading={loading}>
                            Login
                        </LoadingButton>
                    </Stack>
                </Box>
            </Container>
        </FormProvider>
    )
}
