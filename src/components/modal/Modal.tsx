import CloseRoundedIcon from '@mui/icons-material/CloseRounded'
import { Box, Modal, Stack, SwipeableDrawer, Typography, useMediaQuery, useTheme } from '@mui/material'
import { useEffect, useState } from 'react'

export let MODAL: {
    open: (customCompoment?: JSX.Element | JSX.Element[] | (() => JSX.Element)) => void
    reparent: (child: JSX.Element, id: string | number) => JSX.Element
    openReparented: (id: string | number) => void
    close: () => void
} = {
    open: () => {},
    close: () => {},
    openReparented: () => {},
    reparent: () => <></>,
}

export function CustomModalProvider() {
    const [open, setOpen] = useState(false)
    const [content, setContent] = useState<any>(null)
    // const contentRef = useRef<JSX.Element | JSX.Element[]>(<></>)
    const handleClose = () => setOpen(false)
    const theme = useTheme()
    const isDesktop = useMediaQuery(theme.breakpoints.up('sm'))

    const [idRef, setIdRef] = useState<{ [id: string | number]: JSX.Element }>({})
    const [currentId, setCurrentId] = useState<string | number>(-1321465654)

    useEffect(() => {
        MODAL.open = (customCompoment) => {
            if (customCompoment) setContent(customCompoment)
            setCurrentId(-1321465654)
            setOpen(true)
        }

        MODAL.reparent = (element, id) => {
            setIdRef((obj) => ({ ...obj, [id]: <>{element}</> }))
            return <></>
        }

        MODAL.openReparented = (id) => {
            setCurrentId(id)
            setContent(null)
            setOpen(true)
        }

        MODAL.close = handleClose
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
                        {idRef[currentId]}
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
                        <Box overflow='auto' maxHeight='90vh' p={2} marginTop={4} borderTop='solid 1px gray' bgcolor='#F9F9F9' borderRadius={2}>
                            {content}
                            {idRef[currentId]}
                        </Box>
                    </Box>
                </Modal>
            )}
        </>
    )
}
