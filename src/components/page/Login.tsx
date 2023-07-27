import { LoadingButton } from '@mui/lab'
import { Stack } from '@mui/material'
import Box from '@mui/material/Box'
import Container from '@mui/material/Container'
import Typography from '@mui/material/Typography'
import * as React from 'react'
import { useContext, useRef, useState } from 'react'
import { AuthContext } from '../../context/auth'
import FormProvider from '../providers/FormProvider'
import ReCAPTCHA from 'react-google-recaptcha'

export function Login({
    imgURL = '',
    name = 'Login',
    children,
    loginURL,
    captchaSiteKey,
}: {
    imgURL?: string
    loginURL: string
    children: JSX.Element | JSX.Element[]
    name?: string
    captchaSiteKey?: string
}) {
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState(false)
    const [captchaSolved, setCaptchaSolved] = useState(false)
    const [captchaToken, setCaptchaToken] = useState('')

    const captcha = useRef<ReCAPTCHA>(null)

    const { adLogin } = useContext(AuthContext)

    function onLogin(data: any) {
        adLogin(loginURL, data, setLoading, setError, captchaToken)
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
                        {captchaSiteKey && (
                            <ReCAPTCHA
                                ref={captcha}
                                hl='pt'
                                sitekey={captchaSiteKey}
                                onExpired={() => setCaptchaSolved(false)}
                                onChange={(e) => {
                                    setCaptchaToken(e!), e && setCaptchaSolved(true)
                                }}
                            />
                        )}
                        <LoadingButton type='submit' fullWidth variant='contained' loading={loading} disabled={!!captchaSiteKey ? !captchaSolved : false}>
                            Login
                        </LoadingButton>

                        {error && (
                            <Box bgcolor='#ce4257' padding={2} borderRadius={2} color='white'>
                                <Typography>Dados incorretos. Tente novamente!</Typography>
                            </Box>
                        )}
                    </Stack>
                </Box>
            </Container>
        </FormProvider>
    )
}
