import { Box, Grid, Stack } from '@mui/material'
import InputLabel from '@mui/material/InputLabel'
import get from 'lodash.get'
import React, { ReactElement, useContext, useEffect, useRef } from 'react'
import { FormContext } from '../../../context/form'
import Switch from '../switch/Switch'
import MaskInput from './MaskInput'

export default function FileUpload({
    name,
    required = false,
    title,
    customPlaceholder,
    defaultChecked = false,
    xs = 12,
    sm,
    md,
    ...props
}: {
    name: string
    children?: ReactElement | ReactElement[]
    title?: string
    defaultChecked?: boolean
    customPlaceholder?: string
    required?: boolean
    xs?: number
    sm?: number
    md?: number
}) {
    const context = useContext(FormContext)
    const switchName = `${name}-switch`

    let oldValue = useRef<boolean | null>(null)

    useEffect(() => {
        const active = context?.formGetValues(switchName)
        if (oldValue.current === active) return

        oldValue.current = active

        const children = Array.isArray(props.children) ? props.children : [props.children]

        const keys = children.map((x) => x?.props.name)

        if (!active) context?.formUnregister(name)
        else context?.formUnregister(keys)
    }, [context])

    return (
        <Grid item {...{ xs, sm, md }}>
            {title && (
                <InputLabel required={required} sx={{ textTransform: 'capitalize' }}>
                    {title}
                </InputLabel>
            )}
            <Stack direction='row'>
                <Switch name={switchName} defaultChecked={defaultChecked} />
                <Box hidden={!context?.formWatch(switchName)}>
                    <MaskInput
                        formConfig={{
                            ...context?.formRegister(name, {
                                validate: (v, f) => {
                                    if (context?.formWatch(switchName)) {
                                        if (v.length <= 0 && required) return 'Este campo é obrigatório'
                                    }
                                },
                            }),
                            placeholder: customPlaceholder ? customPlaceholder : '',
                            size: 'small',
                            error: get(context?.errors, name) ? true : false,
                            helperText: get(context?.errors, name)?.message as string,
                            fullWidth: false,
                        }}
                        maskProps={{
                            mask: /^\d+$/,
                        }}
                    />
                </Box>
                <Box hidden={context?.formWatch(switchName)}>{props.children && props.children}</Box>
            </Stack>
        </Grid>
    )
}
