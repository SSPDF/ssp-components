import { Box, Checkbox, Grid, Stack, TextField } from '@mui/material'
import get from 'lodash.get'
import React, { useContext, useEffect } from 'react'
import { FormContext } from '../../../context/form'

interface OptionalInputProps {
    title: string
    name: string
    required?: boolean
    xs?: number
    sm?: number
    md?: number
}

export default function OptionalInput({ title, name, required = false, xs = 12, sm, md }: OptionalInputProps) {
    const context = useContext(FormContext)!
    const checkName = `switch-${name}`

    useEffect(() => {
        const checkValue = context.formWatch(checkName)

        if (!checkValue) context.formSetValue(name, undefined)
    }, [context])

    return (
        <Grid item {...{ xs, sm, md }}>
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
                                if (!!value) {
                                    if (!v || (v.length <= 0 && required)) return 'Este campo não pode ser vazio'
                                }
                            },
                        })}
                        required
                        error={!!get(context.errors, name!)}
                        helperText={get(context.errors, name!)?.message as string}
                        placeholder={title}
                        sx={{
                            bgcolor: 'white',
                            '& .MuiOutlinedInput-root': {
                                borderRadius: '8px',
                                '& fieldset': {
                                    borderColor: '#E0E0E0',
                                },
                                '&:hover fieldset': {
                                    borderColor: '#BDBDBD',
                                },
                                '&.Mui-focused fieldset': {
                                    borderColor: 'primary.main',
                                    borderWidth: '1px',
                                },
                            },
                        }}
                    />
                ) : (
                    <TextField
                        size='small'
                        disabled
                        placeholder={title}
                        sx={{
                            bgcolor: 'white',
                            '& .MuiOutlinedInput-root': {
                                borderRadius: '8px',
                                '& fieldset': {
                                    borderColor: '#E0E0E0',
                                },
                            },
                        }}
                    />
                )}
            </Stack>
        </Grid>
    )
}
