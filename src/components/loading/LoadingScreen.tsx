import React from 'react'
import { Stack, Box, Typography, LinearProgress, SxProps } from '@mui/material'

interface LoadingScreenProps {
    textMessage?: string
    containerSx: SxProps
}

export const LoadingScreen = ({ textMessage, containerSx }: LoadingScreenProps) => {
    return (
        <Stack
            sx={{
                justifyContent: 'center',
                alignItems: 'center',
                gap: 4,
                width: '100%',
                ...containerSx,
            }}
        >
            <Box
                sx={{
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                }}
            >
                <Typography variant='h6'>{textMessage ?? 'Carregando...'}</Typography>
            </Box>
            <LinearProgress sx={{ width: '100%' }} />
        </Stack>
    )
}
