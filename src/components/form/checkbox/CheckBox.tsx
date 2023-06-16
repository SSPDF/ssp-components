import { Checkbox, FormControlLabel, Grid } from '@mui/material'
import { useContext } from 'react'
import { FormContext } from '../../../context/form'

import React from 'react'

export default function CheckBox({ name, title, defaultValue = false, xs = 12, sm, md }: { name: string; title: string | JSX.Element; defaultValue?: boolean; xs?: number; sm?: number; md?: number }) {
    const context = useContext(FormContext)

    return (
        <Grid item {...{ xs, sm, md }}>
            <FormControlLabel control={<Checkbox size='small' defaultChecked={defaultValue} />} label={title} {...context?.formRegister(name!)} />
        </Grid>
    )
}
