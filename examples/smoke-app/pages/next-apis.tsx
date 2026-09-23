import { Container, MenuItem, Stack, Typography } from '@mui/material'
import { Map, NavBar } from '@ssplib/react-components'

/**
 * Componentes da lib que importam `next/*` — a superfície que um major do Next
 * pode quebrar: a `NavBar` usa `next/image`, `next/link` e `next/router`, e o
 * `Map` é carregado com `next/dynamic` (`ssr: false`).
 *
 * No browser: o logo carrega pelo otimizador de imagem do Next, os botões
 * "Início"/"APIs" navegam via `router.push` e o mapa monta com os tiles.
 */
export default function NextApis() {
    return (
        <>
            <NavBar
                next
                title='smoke-app'
                img='/logo.png'
                links={[
                    { name: 'Início', path: '/' },
                    { name: 'APIs do Next', path: '/next-apis' },
                ]}
                menuItems={<MenuItem>Item</MenuItem>}
            />
            <Container maxWidth='md' sx={{ py: 5 }}>
                <Stack spacing={2}>
                    <Typography variant='h5'>next/image, next/link, next/router e next/dynamic</Typography>
                    <Map firstCoords={[-15.7939, -47.8828]} mapStyle={{ height: 300 }} />
                </Stack>
            </Container>
        </>
    )
}
