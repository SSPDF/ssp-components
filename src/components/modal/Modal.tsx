import { Box, Drawer, Modal, Stack, SwipeableDrawer, Typography, useMediaQuery, useTheme } from '@mui/material'
import CloseRoundedIcon from '@mui/icons-material/CloseRounded'
import React, { Dispatch, SetStateAction, useEffect, useState } from 'react'

export let sspModal: {
    open: (customCompoment?: JSX.Element | JSX.Element[] | (() => JSX.Element)) => void
    close: () => void
} = {
    open: () => {},
    close: () => {},
}

export function CustomModalProvider() {
    const [open, setOpen] = useState(false)
    const [content, setContent] = useState<JSX.Element | JSX.Element[]>(<></>)
    const handleClose = () => setOpen(false)

    const theme = useTheme()
    const isDesktop = useMediaQuery(theme.breakpoints.up('sm'))

    useEffect(() => {
        sspModal.open = (customCompoment) => {
            if (customCompoment) setContent(customCompoment)
            setOpen(true)
        }

        sspModal.close = handleClose
    }, [setOpen])

    return (
        <>
            {!isDesktop ? (
                <SwipeableDrawer
                    anchor='bottom'
                    open={open}
                    onClose={handleClose}
                    onOpen={() => {}}
                    PaperProps={{
                        sx: {
                            bgcolor: 'transparent',
                        },
                    }}
                >
                    <Stack direction='row' onClick={handleClose} maxHeight='8vh' height='8vh' justifyContent='center' alignItems='center'>
                        <Typography fontWeight={600} color='white'>
                            Clique fora para fechar
                        </Typography>
                    </Stack>
                    <Box p={2} maxHeight='92vh' bgcolor='white' overflow='auto'>
                        {content}
                    </Box>
                </SwipeableDrawer>
            ) : (
                <Modal open={open} onClose={handleClose}>
                    <Box
                        sx={{
                            position: 'absolute' as 'absolute',
                            top: '50%',
                            left: '50%',
                            transform: 'translate(-50%, -50%)',
                            width: 400,
                            borderRadius: 2,
                            bgcolor: 'white',
                            border: '1px solid #454545',
                            boxShadow: 24,
                        }}
                    >
                        <Box
                            onClick={handleClose}
                            width='fit-content'
                            height='fit-content'
                            position='absolute'
                            right={0}
                            top={0}
                            margin={0.6}
                            sx={{
                                ':hover': {
                                    transform: 'scale(1.03)',
                                    transition: 'all 500ms',
                                    cursor: 'pointer',
                                },
                            }}
                        >
                            <CloseRoundedIcon
                                sx={{
                                    transform: 'scale(.9)',
                                }}
                            />
                        </Box>
                        <Box overflow='auto' maxHeight='90vh' p={2} marginTop={4} borderTop='solid 1px gray'>
                            {content}
                        </Box>
                    </Box>
                </Modal>
            )}
        </>
    )
}
