import { PendingRounded } from '@mui/icons-material'
import { Box, LinearProgress, Skeleton, Stack } from '@mui/material'
import Typography from '@mui/material/Typography'
import React from 'react'
import { useThemedColor } from '../../utils/useThemedColor'

interface TableLoadingStateProps {
    tableName: string
}

export function TableLoadingState({ tableName }: TableLoadingStateProps) {
    const color = useThemedColor()
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
                            fill: color('#5e5e5e', (p) => p.text.secondary),
                        }}
                    />
                    <Typography
                        sx={{
                            fontWeight: 600,
                            fontSize: 20,
                            textTransform: 'capitalize',
                            textAlign: 'center',
                            color: color('#5e5e5e', (p) => p.text.secondary),
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
                                borderBottom: color('1px solid #cacaca', (p) => `1px solid ${p.divider}`),
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
