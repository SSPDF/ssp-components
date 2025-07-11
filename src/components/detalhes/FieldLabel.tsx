import { Grid, Stack, Typography } from '@mui/material'
import React from 'react'

export function FieldLabel({ title, xs = 12, tag, md, lg, paddingBottom = 3 }: { title: string; tag?: string; xs?: number; md?: number; lg?: number; paddingBottom?: number }) {
    let color = tag && tag === 'Não' ? '#FECACA' : tag === 'Sim' ? '#BBF7D0' : '#E2E8F0'

    return (
        <Grid
            paddingBottom={paddingBottom}
            paddingRight={2}
            size={{
                xs: xs,
                md: md,
                lg: lg
            }}>
            <Stack spacing={1} direction='row'>
                <Typography
                    sx={{
                        backgroundColor: '#E2E8F0',
                        maxWidth: 'max-content',
                        paddingX: 1,
                        borderRadius: 2,
                        color: '#1E293B',
                    }}
                    fontWeight={600}
                    fontSize={16}
                >
                    {title}
                </Typography>
                {tag && (
                    <Typography
                        sx={{
                            backgroundColor: color,
                            maxWidth: 'max-content',
                            paddingX: 1,
                            borderRadius: 2,
                            color: '#1E293B',
                        }}
                        fontWeight={600}
                    >
                        {tag}
                    </Typography>
                )}
            </Stack>
        </Grid>
    );
}
