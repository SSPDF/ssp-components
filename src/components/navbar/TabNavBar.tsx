import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown'
import LogoutOutlinedIcon from '@mui/icons-material/LogoutOutlined'
import MenuIcon from '@mui/icons-material/Menu'
import PersonIcon from '@mui/icons-material/Person'
import { AppBar, Avatar, Box, Button, IconButton, Menu, MenuItem, Stack, Typography, useTheme } from '@mui/material'
import LinearProgress from '@mui/material/LinearProgress'
import Image from 'next/image'
import Link from 'next/link'
import { NextRouter, useRouter } from 'next/router'
import React, { useCallback, useContext, useState } from 'react'
import { AuthContext } from '../../context/auth'
import { LoginOptions, LogoutOptions } from '../../types/auth'


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
    customBgColor = '#FFFFFF',
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
    menuItems: JSX.Element | JSX.Element[]
    next?: boolean
    el?: JSX.Element
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
    const theme = useTheme()
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
        [router]
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
            <Box position={pos} sx={{ width: '100%', zIndex: 100 }}>
                <AppBar position='relative' elevation={0} sx={{ color: theme.palette.getContrastText(customBgColor), paddingX: { xs: 1, [breakpoint]: 4 }, bgcolor: customBgColor }}>
                    <Stack direction='row' justifyContent='space-between' bgcolor={customBgColor}>
                        <Stack direction='row' alignItems='center' spacing={2} marginRight={2} sx={{ display: { xs: 'none', [breakpoint]: 'flex' }, width: '100%' }}>
                            <Link href='/'>{next ? <Image src={img} alt={title} width={40} height={40} /> : <img src={img} height={35} />}</Link>
                            <Box>
                                <Typography variant='subtitle1' fontWeight={600}>
                                    {title}
                                </Typography>
                            </Box>
                        </Stack>
                        <Stack direction='row' width='100%' justifyContent='center' alignItems='center' spacing={2} sx={{ display: { xs: 'none', [breakpoint]: 'flex' } }}>
                            {links.map((x, index) => {
                                const isActive = next ? verificarRota(router?.pathname ?? '', x.path) : verificarRota(route, x.path)

                                return (
                                    <Box
                                        key={JSON.stringify({ x, index })}
                                        paddingX={3}
                                        paddingY={0.8}
                                        borderRadius={50}
                                        bgcolor={isActive ? color : 'transparent'}
                                        color={isActive ? '#fff' : 'inherit'}
                                        sx={{
                                            transition: 'all 0.2s ease-in-out',
                                            ':hover': {
                                                backgroundColor: isActive ? color : 'rgba(0,0,0,0.05)',
                                                cursor: 'pointer',
                                                userSelect: 'none',
                                                filter: isActive ? 'brightness(1.1)' : 'none'
                                            },
                                        }}
                                        onClick={(e) => {
                                            next && console.log('pathname:', router?.pathname, ':=', x.path)
                                            changeRoute(e, x.path)
                                        }}
                                    >
                                        <Stack justifyContent='center'>
                                            <Typography fontWeight={isActive ? 600 : 500} whiteSpace='nowrap'>{x.name}</Typography>
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
                                                <Typography textTransform='capitalize'>{x.name}</Typography>
                                            </MenuItem>
                                        ))}
                                    </Menu>
                                </>
                            )}
                        </Box>

                        {/* Desktop */}
                        <Stack direction='row' justifyContent='flex-end' alignItems='center' sx={{ width: { [breakpoint]: '100%' } }} paddingY={1}>
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
                                                        <LogoutOutlinedIcon sx={{ fill: '#545454' }} />
                                                        <Typography textTransform='capitalize'>{logoutMsg}</Typography>
                                                    </Stack>
                                                </MenuItem>
                                            </Menu>
                                        </Box>
                                        <Stack direction='row' spacing={0.4} alignItems='center' onClick={(e) => setAvatarAnchor(e.currentTarget as any)} sx={{ userSelect: 'none' }}>
                                            <Typography>Olá,</Typography>
                                            <Typography fontWeight={600}>{user.given_name}</Typography>
                                            <KeyboardArrowDownIcon />
                                        </Stack>
                                    </Stack>
                                ) : type === 'govbr' ? (
                                    <Button
                                        variant='contained'
                                        size='small'
                                        startIcon={<PersonIcon />}
                                        onClick={() => login(loginOptions)}
                                        sx={{ color: 'white', textTransform: 'inherit', borderRadius: 50, paddingX: 2 }}
                                    >
                                        <Typography fontWeight={600} fontSize={15} padding={0.4}>
                                            Entrar com o gov.br
                                        </Typography>
                                    </Button>
                                ) : (
                                    <Button
                                        variant='contained'
                                        size='small'
                                        startIcon={<PersonIcon />}
                                        onClick={() => login(loginOptions)}
                                        sx={{ color: 'white', textTransform: 'inherit', borderRadius: 50, paddingX: 2 }}
                                    >
                                        <Typography fontWeight={600} fontSize={15} padding={0.4}>
                                            Entrar
                                        </Typography>
                                    </Button>
                                )}
                            </Stack>
                        </Stack>
                    </Stack>
                </AppBar>
                {loading && <LinearProgress />}
            </Box >
            <Box paddingBottom={paddingBottom} />
        </>
    )
}