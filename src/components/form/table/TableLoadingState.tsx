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
                height: '100%',
                width: '100%',
            }}
            justifyContent='center'
            alignItems='center'
        >
            <Box width='100%'>
                <Stack direction='row' justifyContent='center' alignItems='center' justifyItems='center' spacing={2} marginY={4}>
                    <PendingRounded
                        sx={{
                            fill: color('#5e5e5e', (p) => p.text.secondary),
                        }}
                    />
                    <Typography fontWeight={600} fontSize={20} textTransform='capitalize' textAlign='center' color={color('#5e5e5e', (p) => p.text.secondary)}>
                        Carregando {tableName}
                    </Typography>
                </Stack>
                <LinearProgress color='inherit' />
                {Array(10)
                    .fill('')
                    .map((x) => (
                        <Stack
                            direction={{
                                xs: 'column',
                                md: 'row',
                            }}
                            spacing={{
                                xs: 3,
                                md: 1,
                            }}
                            justifyContent='space-between'
                            paddingY={8}
                            borderBottom={color('1px solid #cacaca', (p) => `1px solid ${p.divider}`)}
                        >
                            {Array(7)
                                .fill(0)
                                .map((y) => (
                                    <Box>
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
