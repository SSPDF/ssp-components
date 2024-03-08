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

function verificarRota(route: string, path: string) {
    if (path === '/') return route === path

    return route.startsWith(path)
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
    pos?: 'fixed' | 'inherit'
}) {
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
                <AppBar position='relative' elevation={0} sx={{ backgroundColor: 'white', color: 'black', paddingX: { xs: 1, md: 4 } }}>
                    <Stack direction='row' justifyContent='space-between'>
                        <Stack direction='row' alignItems='center' spacing={2} marginRight={2} sx={{ display: { xs: 'none', md: 'flex' }, width: '100%' }}>
                            <Link href='/'>{next ? <Image src={img} alt={title} width={40} height={40} /> : <img src={img} height={35} />}</Link>
                            <Box>
                                <Typography variant='subtitle1' fontWeight={600}>
                                    {title}
                                </Typography>
                            </Box>
                        </Stack>
                        <Stack direction='row' width='100%' justifyContent='center' alignItems='center' spacing={2} sx={{ display: { xs: 'none', md: 'flex' } }}>
                            {links.map((x) => (
                                <Box
                                    borderBottom={next ? (verificarRota(router?.pathname ?? '', x.path) ? `solid 4px ${color}` : '') : verificarRota(route, x.path) ? `solid 4px ${color}` : ''}
                                    height='100%'
                                    paddingX={2}
                                    sx={{
                                        ':hover': {
                                            backgroundColor: '#fcfcfc',
                                            cursor: 'pointer',
                                            userSelect: 'none',
                                        },
                                    }}
                                    onClick={(e) => {
                                        next && console.log('pathname:', router?.pathname, ':=', x.path)
                                        changeRoute(e, x.path)
                                    }}
                                >
                                    <Stack height='100%' justifyContent='center'>
                                        {x.name}
                                    </Stack>
                                </Box>
                            ))}
                        </Stack>
                        {/* mobile */}
                        <Box
                            sx={{
                                display: {
                                    xs: 'flex',
                                    md: 'none',
                                },
                            }}
                        >
                            {links.length > 0 && (
                                <>
                                    <IconButton onClick={onMenuClick}>
                                        <MenuIcon />
                                    </IconButton>
                                    <Menu open={menuOpen} onClose={closeMenu} anchorEl={anchor}>
                                        {links.map((x) => (
                                            <MenuItem key={`navmenu${x}`} onClick={(e) => onMenuItemClick(e, x.path)}>
                                                <Typography textTransform='capitalize'>{x.name}</Typography>
                                            </MenuItem>
                                        ))}
                                    </Menu>
                                </>
                            )}
                        </Box>

                        {/* Desktop */}
                        <Stack direction='row' justifyContent='flex-end' alignItems='center' sx={{ width: { md: '100%' } }} paddingY={1}>
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
                                                    onClick={(e) => {
                                                        setAvatarAnchor(null)
                                                        logout()
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
                                        onClick={login}
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
                                        onClick={login}
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
            </Box>
            <Box paddingBottom={paddingBottom} />
        </>
    )
}
