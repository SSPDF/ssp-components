import { Box, FormControl, FormHelperText, FormLabel, Grid, Typography, useTheme } from '@mui/material'
import React, { useContext, useEffect } from 'react'
import { Controller } from 'react-hook-form'
import { FormContext } from '../../../context/form'
import { ErrorOutline } from '@mui/icons-material'

export function Radio({
    name,
    options,
    title,
    required = false,
    disabled = false,
    row = false,
    xs = 12,
    sm,
    md,
    defaultValue,
    watchValue,
}: {
    name: string
    options: { label: string; value: any }[]
    title?: string
    required?: boolean
    disabled?: boolean
    row?: boolean
    xs?: number
    sm?: number
    md?: number
    defaultValue?: any
    watchValue?: any
}) {
    const context = useContext(FormContext)!
    const theme = useTheme()

    useEffect(() => {
        if (watchValue !== undefined) context.formSetValue(name, watchValue)
    }, [watchValue, name, context])

    return (
        <Grid item {...{ xs, sm, md }}>
            <Controller
                name={name}
                control={context.formControl}
                defaultValue={defaultValue ?? ''}
                rules={{ required: required ? 'Este campo é obrigatório' : false }}
                render={({ field, fieldState: { error } }) => (
                    <FormControl error={!!error} disabled={disabled} fullWidth>
                        {title && (
                            <FormLabel
                                required={required}
                                error={!!error}
                                sx={{ mb: 1, fontWeight: 500, fontSize: '0.875rem' }}
                            >
                                {title}
                            </FormLabel>
                        )}
                        <Box display='flex' flexDirection={row ? 'row' : 'column'} gap={1} flexWrap='wrap'>
                            {options.map((option, index) => {
                                const isSelected = field.value === option.value
                                return (
                                    <Box
                                        key={index}
                                        onClick={() =>
                                            !disabled &&
                                            field.onChange(isSelected && !required ? '' : option.value)
                                        }
                                        sx={{
                                            border: '1px solid',
                                            borderColor: isSelected ? theme.palette.primary.main : '#E0E0E0',
                                            borderRadius: '8px',
                                            padding: '8px 16px',
                                            cursor: disabled ? 'not-allowed' : 'pointer',
                                            backgroundColor: isSelected ? `${theme.palette.primary.main}10` : 'white',
                                            transition: 'all 0.2s',
                                            display: 'flex',
                                            alignItems: 'center',
                                            position: 'relative',
                                            opacity: disabled ? 0.6 : 1,
                                            '&:hover': {
                                                borderColor: !disabled && !isSelected ? theme.palette.grey[400] : undefined,
                                                backgroundColor:
                                                    !disabled && !isSelected ? theme.palette.grey[50] : undefined,
                                            },
                                        }}
                                    >
                                        <Box
                                            sx={{
                                                width: '18px',
                                                height: '18px',
                                                borderRadius: '50%',
                                                border: '2px solid',
                                                borderColor: isSelected ? theme.palette.primary.main : '#9E9E9E',
                                                mr: 1.5,
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                transition: 'all 0.2s',
                                            }}
                                        >
                                            {isSelected && (
                                                <Box
                                                    sx={{
                                                        width: '10px',
                                                        height: '10px',
                                                        borderRadius: '50%',
                                                        backgroundColor: theme.palette.primary.main,
                                                    }}
                                                />
                                            )}
                                        </Box>
                                        <Typography
                                            variant='body2'
                                            color={isSelected ? 'primary.main' : 'text.primary'}
                                            fontWeight={isSelected ? 600 : 400}
                                        >
                                            {option.label}
                                        </Typography>
                                    </Box>
                                )
                            })}
                        </Box>
                        {error && (
                            <FormHelperText
                                sx={{
                                    backgroundColor: '#FFEBEE',
                                    borderRadius: '8px',
                                    padding: '8px 12px',
                                    marginTop: '8px',
                                    border: '1px solid #FFCDD2',
                                    color: 'error.main',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: 1,
                                    marginLeft: 0,
                                    marginRight: 0,
                                }}
                            >
                                <ErrorOutline fontSize='small' />
                                {error.message}
                            </FormHelperText>
                        )}
                    </FormControl>
                )}
            />
        </Grid>
    )
}

export default React.memo(Radio)
