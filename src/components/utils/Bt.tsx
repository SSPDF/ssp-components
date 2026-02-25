import { Button, ButtonProps } from '@mui/material'

import tinycolor from 'tinycolor2'

interface CustomButton extends ButtonProps {
    customColor?: tinycolor.ColorInput
    customFontColor?: tinycolor.ColorInput
}

export default function Bt({ customColor = '#383838', customFontColor = 'white', ...props }: CustomButton) {
    const bgColor = tinycolor(customColor)

    return (
        <Button
            {...props}
            sx={{
                bgcolor: bgColor.toHexString(),
                color: tinycolor(customFontColor).toHexString(),
                ':hover': {
                    bgcolor: bgColor.darken(10).toHexString(),
                },
                boxShadow: 'none',
                borderRadius: 3,
                textTransform: 'capitalize',
                paddingX: 2,
            }}
            size='small'
        >
            {props.children}
        </Button>
    )
}
