import { Box, Checkbox, Grid, Stack, TextField } from '@mui/material'
import get from 'lodash.get'
import React, { useContext, useEffect } from 'react'
import { FormContext } from '../../../context/form'
import { SwitchWatch } from '../switch/ToggleVisibility'

export default function SSPOtherCheckBox({ name, required = false, xs = 12, sm, md }: { name: string; required?: boolean; xs?: number; sm?: number; md?: number }) {
    const context = useContext(FormContext)!
    const checkName = `switch-${name}`

    useEffect(() => {
        const checkValue = context.formWatch(checkName)

        if (!checkValue) context.formSetValue(name, undefined)
    }, [context])

    return (
        <Grid
            size={{
                xs: xs,
                sm: sm,
                md: md
            }}>
            <Stack direction='row'>
                <Box>
                    <Checkbox size='small' {...context.formRegister(checkName)} sx={{ paddingLeft: 0, margin: 0 }} />
                </Box>
                {context.formWatch(checkName) ? (
                    <TextField
                        size='small'
                        {...context.formRegister(name!, {
                            validate: (v, f) => {
                                const value = context.formWatch(checkName)
                                if (value === true) {
                                    if (!v || (v.length <= 0 && required)) return 'Este campo não pode ser vazio'
                                }
                            },
                        })}
                        required
                        error={get(context.errors, name!) ? true : false}
                        helperText={get(context.errors, name!)?.message as string}
                        placeholder='Outro'
                    />
                ) : (
                    <TextField size='small' disabled placeholder='Outro' />
                )}
            </Stack>
        </Grid>
    );
}
