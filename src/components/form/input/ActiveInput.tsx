import { Box, Grid, Stack } from '@mui/material'
import InputLabel from '@mui/material/InputLabel'
import get from 'lodash.get'
import React, { ReactElement, useContext, useEffect, useRef } from 'react'
import { FormContext } from '../../../context/form'
import Switch from '../switch/Switch'
import MaskInput from './MaskInput'
import { SwitchWatch } from '../switch/ToggleVisibility'
import { Input } from './Input'

export default function FileUpload({
    name,
    required = false,
    title,
    defaultChecked = false,
    xs = 12,
    unregisterNameList,
    sm,
    md,
    ...props
}: {
    name: string
    children?: [ReactElement, ReactElement]
    title?: string
    unregisterNameList: string[]
    defaultChecked?: boolean
    required?: boolean
    xs?: number
    sm?: number
    md?: number
}) {
    const switchName = `${name}-switch`

    return (
        <Grid item {...{ xs, sm, md }}>
            {title && (
                <InputLabel required={required} sx={{ textTransform: 'capitalize' }}>
                    {title}
                </InputLabel>
            )}
            <Stack direction='row'>
                <Switch name={switchName} defaultChecked={defaultChecked} />

                <SwitchWatch switchId={switchName} unregisterNameList={unregisterNameList}>
                    {/* {props.children![0]} */}
                    <Input name='ddd' type='input' />
                </SwitchWatch>
                {/* <SwitchWatch switchId={switchName} unregisterNameList={unregisterNameList} invert={true}>
                    {props.children![1]}
                </SwitchWatch> */}
            </Stack>
        </Grid>
    )
}
