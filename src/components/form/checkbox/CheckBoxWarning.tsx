import { Card, Checkbox, FormControlLabel, Grid } from '@mui/material'
import Typography from '@mui/material/Typography'
import React, { ReactElement, useContext } from 'react'
import { FormContext } from '../../../context/form'

export default function CheckBoxWarning({
    name,
    title,
    customWarning,
    defaultValue = false,
    xs = 12,
    sm,
    md,
}: {
    name: string
    title: string
    customWarning?: ReactElement
    defaultValue?: boolean
    xs?: number
    sm?: number
    md?: number
}) {
    const context = useContext(FormContext)!

    return (
        <Grid item {...{ xs, sm, md }}>
            <FormControlLabel control={<Checkbox size='small' {...context.formRegister(name!)} defaultChecked={defaultValue} />} label={title} />
            {context.formWatch(name!) && (
                <Card sx={{ bgcolor: '#FFFBF5', color: '#F59E0B', padding: 1, paddingLeft: 2 }}>
                    {customWarning ? (
                        customWarning
                    ) : (
                        <Typography>
                            <b>Atenção</b> Eventos da natureza <i>{title}</i> possuem regras específicas
                        </Typography>
                    )}
                </Card>
            )}
        </Grid>
    )
}
