import { Card, Checkbox, FormControlLabel, Grid } from '@mui/material'
import Typography from '@mui/material/Typography'
import React, { ReactElement, useContext } from 'react'
import formContext from '../../../context/form'

export default function CheckBoxWarning({ name, title, customWarning, xs = 12, sm, md }: { name: string; title: string; customWarning?: ReactElement; xs?: number; sm?: number; md?: number }) {
    const context = useContext(formContext)!

    return (
        <Grid item {...{ xs, sm, md }}>
            <FormControlLabel control={<Checkbox size='small' {...context.formRegister(name!)} />} label={title} />
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
