import { Box, Grid, Stack, Typography } from '@mui/material'

export function Field({ name, title, tag, xs = 12, md, lg }: { title: string; name: string; tag?: string; xs?: number; md?: number; lg?: number }) {
    let color =
        tag && tag === 'Distrital'
            ? '#BFDBFE'
            : tag === 'Estadual'
            ? '#BBF7D0'
            : tag === 'Federal'
            ? '#FEF08A'
            : tag === 'Internacional'
            ? '#FED7AA'
            : tag === 'Não'
            ? '#FECACA'
            : tag === 'Sim'
            ? '#BBF7D0'
            : '#BBF7D0'

    return (
        <Grid item paddingBottom={3} {...{ xs, md, lg }} paddingRight={2}>
            <Stack spacing={1}>
                <Stack spacing={1} direction={'row'}>
                    <Typography
                        sx={{
                            backgroundColor: '#E2E8F0',
                            maxWidth: 'max-content',
                            paddingX: 1,
                            borderRadius: 2,
                            color: '#1E293B',
                        }}
                        fontWeight={600}
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
                {name && <Box>{String(name) === 'false' ? 'Não' : String(name) === 'true' ? 'Sim' : String(name) === '' ? '' : !name ? 'Não informado' : String(name)}</Box>}
            </Stack>
        </Grid>
    )
}
