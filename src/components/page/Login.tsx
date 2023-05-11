import { Stack } from '@mui/material'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Container from '@mui/material/Container'
import Typography from '@mui/material/Typography'
import * as React from 'react'
import Input from '../form/input/Input'

export default function SignIn({ imgURL = '', name = 'Login' }: { imgURL?: string; name?: string }) {
    return (
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
                    <Stack spacing={1}>
                        <Input name='username' type='input' customPlaceholder='Usuário' required />
                        <Input name='password' type='password' customPlaceholder='Senha' required />
                    </Stack>
                    <Button type='submit' fullWidth variant='contained'>
                        Login
                    </Button>
                </Stack>
            </Box>
        </Container>
    )
}
