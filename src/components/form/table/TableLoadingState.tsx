import { PendingRounded } from '@mui/icons-material'
import { Box, LinearProgress, Skeleton, Stack } from '@mui/material'
import Typography from '@mui/material/Typography'
import React from 'react'

interface TableLoadingStateProps {
    tableName: string
}

export function TableLoadingState({ tableName }: TableLoadingStateProps) {
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
                            fill: '#5e5e5e',
                        }}
                    />
                    <Typography fontWeight={600} fontSize={20} textTransform='capitalize' textAlign='center' color='#5e5e5e'>
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
                            borderBottom='1px solid #cacaca'
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
