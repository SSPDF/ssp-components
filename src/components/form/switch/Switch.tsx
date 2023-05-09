import { FormControlLabel, InputLabel, Stack, Switch as MUISwitch, Typography } from '@mui/material'
import React, { useContext, useEffect } from 'react'
import { FormContext } from '../../../context/form'

export function Switch({ defaultChecked = false, ...props }: { name: string; defaultChecked?: boolean; title?: string }) {
    const context = useContext(FormContext)

    useEffect(() => {
        context?.formSetValue(props.name, defaultChecked)
    }, [])

    return (
        <Stack sx={{ alignItems: 'center', justifyContent: 'center' }}>
            {props.title && <InputLabel>{props.title}</InputLabel>}
            <FormControlLabel
                control={<MUISwitch defaultChecked={defaultChecked} {...context?.formRegister(props.name)} />}
                label={
                    <Typography width={25} sx={{ userSelect: 'none' }}>
                        {context?.formWatch(props.name) ? 'Sim' : 'Não'}
                    </Typography>
                }
                sx={{ paddingLeft: 1 }}
            />
        </Stack>
    )
}

export default React.memo(Switch)
