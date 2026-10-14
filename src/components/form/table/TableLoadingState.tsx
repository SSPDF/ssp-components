import { PendingRounded } from '@mui/icons-material'
import { Box, LinearProgress, Skeleton, Stack, useTheme } from '@mui/material'
import Typography from '@mui/material/Typography'
import React from 'react'
import { noEscuro } from '../../utils/temaEscuro'

interface TableLoadingStateProps {
    tableName: string
}

export function TableLoadingState({ tableName }: TableLoadingStateProps) {
    const theme = useTheme()
    return (
        <Stack
            sx={{
                justifyContent: 'center',
                alignItems: 'center',
                height: '100%',
                width: '100%',
            }}
        >
            <Box
                sx={{
                    width: '100%',
                }}
            >
                <Stack
                    direction='row'
                    spacing={2}
                    sx={{
                        justifyContent: 'center',
                        alignItems: 'center',
                        justifyItems: 'center',
                        marginY: 4,
                    }}
                >
                    <PendingRounded
                        sx={{
                            fill: '#5e5e5e',
                            ...noEscuro(theme, (p) => ({ fill: p.text.secondary })),
                        }}
                    />
                    <Typography
                        sx={{
                            fontWeight: 600,
                            fontSize: 20,
                            textTransform: 'capitalize',
                            textAlign: 'center',
                            color: '#5e5e5e',
                            ...noEscuro(theme, (p) => ({ color: p.text.secondary })),
                        }}
                    >
                        Carregando {tableName}
                    </Typography>
                </Stack>
                <LinearProgress color='inherit' />
                {Array(10)
                    .fill('')
                    .map((_, i) => (
                        <Stack
                            key={i}
                            direction={{
                                xs: 'column',
                                md: 'row',
                            }}
                            spacing={{
                                xs: 3,
                                md: 1,
                            }}
                            sx={{
                                justifyContent: 'space-between',
                                paddingY: 8,
                                borderBottom: '1px solid #cacaca',
                                ...noEscuro(theme, (p) => ({ borderBottom: `1px solid ${p.divider}` })),
                            }}
                        >
                            {Array(7)
                                .fill(0)
                                .map((_, j) => (
                                    <Box key={j}>
                                        <Skeleton width={60} />
                                        <Skeleton width={120} />
                                    </Box>
                                ))}
                        </Stack>
                    ))}
            </Box>
        </Stack>
    )
}
