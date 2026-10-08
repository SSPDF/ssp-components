import { Grid, Stack, Typography } from '@mui/material'
import React from 'react'
import { noEscuro } from '../utils/temaEscuro'

export function FieldLabel({ title, xs = 12, tag, md, lg, paddingBottom = 3 }: { title: string; tag?: string; xs?: number; md?: number; lg?: number; paddingBottom?: number }) {
    const color = tag && tag === 'Não' ? '#FECACA' : tag === 'Sim' ? '#BBF7D0' : '#E2E8F0'

    return (
        <Grid size={{ xs, md, lg }} sx={{ paddingBottom, paddingRight: 2 }}>
            <Stack spacing={1} direction='row'>
                <Typography
                    sx={(theme) => ({
                        fontWeight: 600,
                        fontSize: 16,
                        backgroundColor: '#E2E8F0',
                        maxWidth: 'max-content',
                        paddingX: 1,
                        borderRadius: 2,
                        color: '#1E293B',
                        ...noEscuro(theme, (p) => ({ backgroundColor: p.action.selected, color: p.text.primary })),
                    })}
                >
                    {title}
                </Typography>
                {tag && (
                    <Typography
                        sx={(theme) => ({
                            fontWeight: 600,
                            backgroundColor: color,
                            maxWidth: 'max-content',
                            paddingX: 1,
                            borderRadius: 2,
                            color: '#1E293B',
                            // Sem Sim/Não, a etiqueta é a cinza neutra: no escuro, igual à do título.
                            ...(color === '#E2E8F0' && noEscuro(theme, (p) => ({ backgroundColor: p.action.selected, color: p.text.primary }))),
                        })}
                    >
                        {tag}
                    </Typography>
                )}
            </Stack>
        </Grid>
    )
}
