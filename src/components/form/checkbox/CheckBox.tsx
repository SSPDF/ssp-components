import { Checkbox, FormControlLabel, Grid } from '@mui/material'
import { useCallback, useContext } from 'react'
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


}: {
    name: string
    title: string | JSX.Element
    defaultValue?: boolean
    onChange?: (e: React.SyntheticEvent<Element, Event>) => void
    xs?: number
    sm?: number
    md?: number

   
}) {
    const context = useContext(FormContext)

    const onClick = useCallback(
        (e: React.SyntheticEvent<Element, Event>) => {
            context?.formSetValue(name!, !context?.formGetValues(name))
        },
        [context, name]
    )

    return (
        <Grid
            size={{
                xs: xs,
                sm: sm,
                md: md
            }}>
            <FormControlLabel control={<Checkbox size='small' defaultChecked={defaultValue} />} label={title} {...context?.formRegister(name!)} onChange={onChange} onClick={onClick} />
        </Grid>
    );
}
