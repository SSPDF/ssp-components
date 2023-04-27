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

export default function NavBar({
    links,
    title,
    img,
    pos = 'fixed',
    next = true,
    el,
    menuItems,
}: {
    links: { name: string; path: string }[]
    title: string
    img: string
    next?: boolean
    menuItems: JSX.Element | JSX.Element[]
    el?: JSX.Element
    pos?: 'fixed' | 'inherit'
}) {
    let router: NextRouter | undefined | null = undefined
    if (next) router = useRouter()

    const { user, login, logout, userLoaded } = useContext(AuthContext)

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
                router.push({
                    pathname: link,
                })
        },
        [router]
    )

    return (
        <>
            <Box position={pos} sx={{ width: '100%', zIndex: 100 }}>
                <AppBar position='relative' elevation={0} sx={{ backgroundColor: '#F1F5F9', color: 'black', paddingY: 1, paddingX: { xs: 1, md: 4 } }}>
                    <Stack direction='row' justifyContent='space-between'>
                        <Stack direction='row' alignItems='center' spacing={2} marginRight={2} sx={{ display: { xs: 'none', md: 'flex' }, width: '100%' }}>
                            <Link href='/'>{next ? <Image src={img} alt='Logo dos Eventos Externos' width={40} height={40} /> : <img src={img} height={35} />}</Link>
                            <Box>
                                <Typography variant='subtitle1' fontWeight={600}>
                                    {title}
                                </Typography>
                            </Box>
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
                        </Box>

                        {/* Desktop */}
                        <Stack direction='row' justifyContent='flex-end' alignItems='center' sx={{ width: { md: '100%' } }}>
                            <Stack direction='row' spacing={2} sx={{ display: { xs: 'none', md: 'flex' } }}>
                                {links.map((x) => (
                                    <Box
                                        key={`navigation${x}`}
                                        sx={{
                                            a: {
                                                color: '#2c7da0',
                                                textDecoration: 'none',
                                                textTransform: 'capitalize',
                                                '&:hover': {
                                                    color: '#90e0ef',
                                                },
                                            },
                                        }}
                                    >
                                        <Link href={x.path} onClick={() => setLoading(true)}>
                                            {x.name}
                                        </Link>
                                    </Box>
                                ))}
                            </Stack>
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
                                                        <Typography textTransform='capitalize'>Sair</Typography>
                                                    </Stack>
                                                </MenuItem>
                                            </Menu>
                                        </Box>
                                        <Stack direction='row' spacing={0.4} alignItems='center' onClick={(e) => setAvatarAnchor(e.currentTarget as any)} sx={{ userSelect: 'none' }}>
                                            <Typography>Olá,</Typography>
                                            <Typography fontWeight={600}>{user.name}</Typography>
                                            <KeyboardArrowDownIcon />
                                        </Stack>
                                    </Stack>
                                ) : (
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
                                )}
                            </Stack>
                        </Stack>
                    </Stack>
                </AppBar>
                {loading && <LinearProgress />}
            </Box>
            <Box paddingBottom={9} />
        </>
    )
}
