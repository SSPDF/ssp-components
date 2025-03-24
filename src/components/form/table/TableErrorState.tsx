import { ReportProblemRounded } from '@mui/icons-material'
import { Box, Typography } from '@mui/material'
import React, { ReactNode } from 'react'

interface TableErrorStateProps {
    error: null | { status: number }
    customErrorMsg?: string | ReactNode
}

export function TableErrorState({ customErrorMsg, error }: TableErrorStateProps) {
    return (
        <Box bgcolor='#fff2c8' color='#3e3129' padding={2} marginX={2} borderRadius={4}>
            <Typography fontSize={24} textAlign='center' fontFamily='Inter'>
                {error.status === 403 && 'Acesso negado'}
                {error.status === 500 && (
                    <Box fontWeight={500} textAlign='center'>
                        <ReportProblemRounded
                            sx={{
                                transform: 'scale(2)',
                                marginY: 1,
                                fill: '#3e3129',
                            }}
                        />
                        <Box>
                            {customErrorMsg ? (
                                customErrorMsg
                            ) : (
                                <>
                                    Não foi possível se conectar ao servidor no momento. Por favor, aguarde alguns instantes e tente de novo.
                                    <br />
                                    <br />
                                    Caso precise de ajuda, entre em contato pelo email: <strong>cdes@ssp.df.gov.br</strong>
                                </>
                            )}
                        </Box>
                    </Box>
                )}
            </Typography>
        </Box>
    )
}
