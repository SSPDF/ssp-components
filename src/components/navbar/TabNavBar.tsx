import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown'
import LogoutOutlinedIcon from '@mui/icons-material/LogoutOutlined'
import MenuIcon from '@mui/icons-material/Menu'
import PersonIcon from '@mui/icons-material/Person'
import { AppBar, Avatar, Box, Button, IconButton, Menu, MenuItem, Stack, Typography } from '@mui/material'
import LinearProgress from '@mui/material/LinearProgress'
import Image from 'next/image'
import Link from 'next/link'
import { NextRouter, useRouter } from 'next/router'
import React, { useCallback, useContext, useState } from 'react'
import { AuthContext } from '../../context/auth'
import { LoginOptions, LogoutOptions } from '../../types/auth'
import { noEscuro } from '../utils/temaEscuro'

function verificarRota(route: string, path: string): boolean {
    if (route === path) {
        return true
    }

    // matches dynamic next routes
    if (path !== '/' && route.startsWith(path + '/[')) {
        return true
    }

    return false
}

export default function TabNavBar({
    links,
    title,
    img,
    pos = 'fixed',
    next = true,
    el,
    menuItems,
    color = 'blue',
    route = '/teste/89',
    paddingBottom = 0,
    logoutMsg = 'Sair',
    customBgColor,
    logoutFunc,
    loginOptions,
    logoutOptions,
    ...props
}: {
    links: { name: string; path: string }[]
    title: string
    img: string
    color?: string
    route?: string
    paddingBottom?: number
    menuItems: React.JSX.Element | React.JSX.Element[]
    next?: boolean
    el?: React.JSX.Element
    logoutMsg?: string
    /** @deprecated Use logoutOptions.onBeforeLogout instead */
    logoutFunc?: () => Promise<void>
    pos?: 'fixed' | 'inherit'
    customBgColor?: string
    /** Opções para configurar o comportamento do login (redirectUri, callbacks, etc) */
    loginOptions?: LoginOptions
    /** Opções para configurar o comportamento do logout (redirectUri, callbacks, etc) */
    logoutOptions?: LogoutOptions
}) {
    // Sem cor do app, a barra é a neutra da lib: branca no claro, `background.paper` no escuro.
    const fundo = customBgColor ?? '#FFFFFF'
    const breakpoint = links.length <= 3 ? 'md' : 'lg'
    let router: NextRouter | undefined | null = undefined
    if (next) router = useRouter()

    const { user, login, logout, type } = useContext(AuthContext)

    const [anchor, setAnchor] = useState(null)
    const [avatarAnchor, setAvatarAnchor] = useState(null)

    const menuOpen = Boolean(anchor)
    const avatarMenu = Boolean(avatarAnchor)
    const [loading, setLoading] = useState(false)

    const onMenuClick = useCallback((e: React.MouseEvent) => {
        setAnchor(e.currentTarget as any)
    }, [])

    const closeMenu = useCallback(() => {
        setAnchor(null)
    }, [])

    const onMenuItemClick = useCallback(
        (e: React.MouseEvent, link: string) => {
            setLoading(true)
            setAnchor(null)

            if (router)
                router
                    .push({
                        pathname: link,
                    })
                    .finally(() => setLoading(false))
            else {
                setLoading(false)
            }
        },
        [router],
    )

    function changeRoute(e: React.MouseEvent, path: string) {
        setLoading(true)

        if (router) {
            router
                .push({
                    pathname: path,
                })
                .finally(() => setLoading(false))
        } else {
            setLoading(false)
        }
    }

    return (
        <>
            <Box
                sx={{
                    position: pos,
                    width: '100%',
                    zIndex: 100,
                }}
            >
                <AppBar
                    position='relative'
                    elevation={0}
                    sx={(t) => ({
                        color: t.palette.getContrastText(fundo),
                        paddingX: { xs: 1, [breakpoint]: 4 },
                        bgcolor: fundo,
                        // No escuro: a barra neutra vira a do tema; a cor do app fica, e é preciso repeti-la
                        // porque o AppBar do MUI escurece sozinho com variáveis CSS (fundo e texto).
                        ...noEscuro(t, (p) => (customBgColor ? { bgcolor: fundo, color: t.palette.getContrastText(fundo) } : { bgcolor: p.background.paper, color: p.text.primary })),
                    })}
                >
                    <Stack
                        direction='row'
                        sx={(t) => ({
                            justifyContent: 'space-between',
                            bgcolor: fundo,
                            ...(!customBgColor && noEscuro(t, (p) => ({ bgcolor: p.background.paper }))),
                        })}
                    >
                        <Stack
                            direction='row'
                            spacing={2}
                            sx={{
                                alignItems: 'center',
                                marginRight: 2,
                                display: { xs: 'none', [breakpoint]: 'flex' },
                                width: '100%',
                            }}
                        >
                            <Link href='/'>{next ? <Image src={img} alt={title} width={40} height={40} /> : <img src={img} height={35} />}</Link>
                            <Box>
                                <Typography
                                    variant='subtitle1'
                                    sx={{
                                        fontWeight: 600,
                                    }}
                                >
                                    {title}
                                </Typography>
                            </Box>
                        </Stack>
                        <Stack
                            direction='row'
                            spacing={2}
                            sx={{
                                width: '100%',
                                justifyContent: 'center',
                                alignItems: 'center',
                                display: { xs: 'none', [breakpoint]: 'flex' },
                            }}
                        >
                            {links.map((x, index) => {
                                const isActive = next ? verificarRota(router?.pathname ?? '', x.path) : verificarRota(route, x.path)

                                return (
                                    <Box
                                        key={JSON.stringify({ x, index })}
                                        onClick={(e) => {
                                            changeRoute(e, x.path)
                                        }}
                                        sx={(t) => ({
                                            paddingX: 3,
                                            paddingY: 0.8,
                                            borderRadius: 50,
                                            bgcolor: isActive ? color : 'transparent',
                                            color: isActive ? '#fff' : 'inherit',
                                            transition: 'all 0.2s ease-in-out',

                                            ':hover': {
                                                backgroundColor: isActive ? color : 'rgba(0,0,0,0.05)',
                                                cursor: 'pointer',
                                                userSelect: 'none',
                                                filter: isActive ? 'brightness(1.1)' : 'none',
                                                ...(!isActive && noEscuro(t, (p) => ({ backgroundColor: p.action.hover }))),
                                            },
                                        })}
                                    >
                                        <Stack
                                            sx={{
                                                justifyContent: 'center',
                                            }}
                                        >
                                            <Typography
                                                sx={{
                                                    fontWeight: isActive ? 600 : 500,
                                                    whiteSpace: 'nowrap',
                                                }}
                                            >
                                                {x.name}
                                            </Typography>
                                        </Stack>
                                    </Box>
                                )
                            })}
                        </Stack>
                        {/* mobile */}
                        <Box
                            sx={{
                                display: {
                                    xs: 'flex',
                                    [breakpoint]: 'none',
                                },
                            }}
                        >
                            {links.length > 0 && (
                                <>
                                    <IconButton onClick={onMenuClick}>
                                        <MenuIcon />
                                    </IconButton>
                                    <Menu open={menuOpen} onClose={closeMenu} anchorEl={anchor}>
                                        {links.map((x, index) => (
                                            <MenuItem key={JSON.stringify({ x, index })} onClick={(e) => onMenuItemClick(e, x.path)}>
                                                <Typography
                                                    sx={{
                                                        textTransform: 'capitalize',
                                                    }}
                                                >
                                                    {x.name}
                                                </Typography>
                                            </MenuItem>
                                        ))}
                                    </Menu>
                                </>
                            )}
                        </Box>

                        {/* Desktop */}
                        <Stack
                            direction='row'
                            sx={{
                                justifyContent: 'flex-end',
                                alignItems: 'center',
                                paddingY: 1,
                                width: { [breakpoint]: '100%' },
                            }}
                        >
                            <Stack direction='row' spacing={2}>
                                <Box>{el}</Box>

                                {user ? (
                                    <Stack
                                        direction='row'
                                        spacing={1}
                                        sx={{
                                            '&:hover': {
                                                backgroundColor: '#a9def9',
                                                cursor: 'pointer',
                                            },
                                            padding: 0.5,
                                            borderRadius: 60,
                                        }}
                                    >
                                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                            <Avatar sx={{ width: 30, height: 30 }} src={user.image as string} />
                                            <Menu
                                                open={avatarMenu}
                                                onClose={(e) => setAvatarAnchor(null)}
                                                anchorEl={avatarAnchor}
                                                disableScrollLock={true}
                                                transformOrigin={{ horizontal: 'right', vertical: 'top' }}
                                                anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
                                                sx={{ '.MuiMenu-paper': { borderRadius: 4 } }}
                                            >
                                                {menuItems}

                                                <MenuItem
                                                    onClick={async (e) => {
                                                        setAvatarAnchor(null)
                                                        // Suporte ao logoutFunc legado via onBeforeLogout
                                                        const mergedOptions: LogoutOptions = {
                                                            ...logoutOptions,
                                                            onBeforeLogout: async () => {
                                                                // Executa logoutFunc legado se existir
                                                                if (logoutFunc) {
                                                                    try {
                                                                        await logoutFunc()
                                                                    } catch (error) {
                                                                        console.error(error)
                                                                    }
                                                                }
                                                                // Executa onBeforeLogout do logoutOptions se existir
                                                                await logoutOptions?.onBeforeLogout?.()
                                                            },
                                                        }
                                                        logout(mergedOptions)
                                                    }}
                                                >
                                                    <Stack direction='row' spacing={1}>
                                                        <LogoutOutlinedIcon sx={(t) => ({ fill: '#545454', ...noEscuro(t, (p) => ({ fill: p.action.active })) })} />
                                                        <Typography
                                                            sx={{
                                                                textTransform: 'capitalize',
                                                            }}
                                                        >
                                                            {logoutMsg}
                                                        </Typography>
                                                    </Stack>
                                                </MenuItem>
                                            </Menu>
                                        </Box>
                                        <Stack
                                            direction='row'
                                            spacing={0.4}
                                            onClick={(e) => setAvatarAnchor(e.currentTarget as any)}
                                            sx={{
                                                alignItems: 'center',
                                                userSelect: 'none',
                                            }}
                                        >
                                            <Typography>Olá,</Typography>
                                            <Typography
                                                sx={{
                                                    fontWeight: 600,
                                                }}
                                            >
                                                {user.given_name}
                                            </Typography>
                                            <KeyboardArrowDownIcon />
                                        </Stack>
                                    </Stack>
                                ) : type === 'govbr' ? (
                                    <Button
                                        variant='contained'
                                        size='small'
                                        startIcon={<PersonIcon />}
                                        onClick={() => login(loginOptions)}
                                        sx={(t) => ({ color: 'white', textTransform: 'inherit', borderRadius: 50, paddingX: 2, ...noEscuro(t, (p) => ({ color: p.primary.contrastText })) })}
                                    >
                                        <Typography
                                            sx={{
                                                fontWeight: 600,
                                                fontSize: 15,
                                                padding: 0.4,
                                            }}
                                        >
                                            Entrar com o gov.br
                                        </Typography>
                                    </Button>
                                ) : (
                                    <Button
                                        variant='contained'
                                        size='small'
                                        startIcon={<PersonIcon />}
                                        onClick={() => login(loginOptions)}
                                        sx={(t) => ({ color: 'white', textTransform: 'inherit', borderRadius: 50, paddingX: 2, ...noEscuro(t, (p) => ({ color: p.primary.contrastText })) })}
                                    >
                                        <Typography
                                            sx={{
                                                fontWeight: 600,
                                                fontSize: 15,
                                                padding: 0.4,
                                            }}
                                        >
                                            Entrar
                                        </Typography>
                                    </Button>
                                )}
                            </Stack>
                        </Stack>
                    </Stack>
                </AppBar>
                {loading && <LinearProgress />}
            </Box>
            <Box
                sx={{
                    paddingBottom: paddingBottom,
                }}
            />
        </>
    )
}
