import { FormControlLabel, InputLabel, Stack, Switch as MUISwitch, Typography } from '@mui/material'
import React, { useContext, useEffect, useMemo } from 'react'
import { FormContext } from '../../../context/form'

interface SwitchProps {
    name: string
    defaultChecked?: boolean
    title?: string
    overrideYes?: string
    overrideNo?: string
}

export function Switch({ defaultChecked = false, ...props }: SwitchProps) {
    const context = useContext(FormContext)

    useEffect(() => {
        context?.formSetValue(props.name, defaultChecked)
    }, [])

    const yesMessage = useMemo(() => props.overrideYes || 'Sim', [props.overrideYes])
    const noMessage = useMemo(() => props.overrideNo || 'Não', [props.overrideNo])

    return (
        <Stack sx={{ alignItems: 'center', justifyContent: 'center' }}>
            {props.title && <InputLabel>{props.title}</InputLabel>}
            <FormControlLabel
                control={<MUISwitch defaultChecked={defaultChecked} {...context?.formRegister(props.name)} />}
                label={
                    <Typography width={25} sx={{ userSelect: 'none', fontWeight: 600 }}>
                        {context?.formWatch(props.name) ? yesMessage : noMessage}
                    </Typography>
                }
                sx={{ paddingLeft: 1 }}
            />
        </Stack>
    )
}

export default React.memo(Switch)
