import { Checkbox, FormControlLabel, Grid } from '@mui/material'
import { useContext } from 'react'
import { FormContext } from '../../../context/form'

import React from 'react'

export default function CheckBox({
    name,
    title,
    defaultValue = false,
    xs = 12,
    sm,
    md,
    onChange,
    onClick,
}: {
    name: string
    title: string | JSX.Element
    defaultValue?: boolean
    onChange?: (e: React.SyntheticEvent<Element, Event>) => void
    xs?: number
    sm?: number
    md?: number
    onClick?: (e: React.SyntheticEvent<Element, Event>) => void
}) {
    const context = useContext(FormContext)

    return (
        <Grid item {...{ xs, sm, md }}>
            <FormControlLabel control={<Checkbox size='small' defaultChecked={defaultValue} />} label={title} {...context?.formRegister(name!)} onChange={onChange} onClick={onClick}/>
        </Grid>
    )
}
