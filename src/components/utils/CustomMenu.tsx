import { Button, ButtonProps, Menu, MenuItem } from '@mui/material'
import React from 'react'
import Bt from './Bt'

interface MenuProps {
    data: { name: string; onClick?: () => void }[]
    btProps?: ButtonProps
    children?: React.ReactNode
}

export default function CustomMenu({ data = [], ...props }: MenuProps) {
    const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null)
    const open = Boolean(anchorEl)
    const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
        setAnchorEl(event.currentTarget)
    }
    const handleClose = () => {
        setAnchorEl(null)
    }

    return (
        <>
            <Bt {...props.btProps} onClick={handleClick}>
                {props.children}
            </Bt>
            <Menu
                id='basic-menu'
                anchorEl={anchorEl}
                open={open}
                onClose={handleClose}
                MenuListProps={{
                    'aria-labelledby': 'basic-button',
                }}
            >
                {data.map((x) => (
                    <MenuItem
                        onClick={(e) => {
                            x.onClick && x.onClick()
                            handleClose()
                        }}
                    >
                        {x.name}
                    </MenuItem>
                ))}
            </Menu>
        </>
    )
}
