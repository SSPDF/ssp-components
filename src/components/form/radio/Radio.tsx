import { Box, FormControl, FormHelperText, FormLabel, Grid, Typography, useTheme } from '@mui/material'
import React, { KeyboardEvent, useContext, useEffect, useId, useRef } from 'react'
import { Controller } from 'react-hook-form'
import { FormContext } from '../../../context/form'
import { ErrorOutlineOutlined } from '@mui/icons-material'

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
    // Acessibilidade (UPGRADE_PLAN.md 5.21a): padrão ARIA de radiogroup. As opções continuam `Box`
    // estilizados, mas o leitor de tela as anuncia como rádios, e o teclado funciona como num
    // grupo de rádios nativo: Tab entra no grupo (na opção marcada), as setas movem a seleção.
    const id = useId()
    const opcoes = useRef<(HTMLDivElement | null)[]>([])

    useEffect(() => {
        if (watchValue !== undefined) context.formSetValue(name, watchValue)
    }, [watchValue, name, context])

    return (
        <Grid size={{ xs, sm, md }}>
            <Controller
                name={name}
                control={context.formControl}
                defaultValue={defaultValue ?? ''}
                rules={{ required: required ? 'Este campo é obrigatório' : false }}
                render={({ field, fieldState: { error } }) => {
                    const marcada = options.findIndex((o) => o.value === field.value)
                    const escolher = (index: number) => {
                        field.onChange(options[index].value)
                        opcoes.current[index]?.focus()
                    }
                    const aoTeclar = (e: KeyboardEvent, index: number, isSelected: boolean) => {
                        if (disabled) return
                        const proxima = { ArrowDown: 1, ArrowRight: 1, ArrowUp: -1, ArrowLeft: -1 }[e.key]
                        if (proxima) {
                            e.preventDefault()
                            escolher((index + proxima + options.length) % options.length)
                        } else if (e.key === ' ' || e.key === 'Enter') {
                            e.preventDefault()
                            field.onChange(isSelected && !required ? '' : options[index].value)
                        }
                    }

                    return (
                        <FormControl error={!!error} disabled={disabled} fullWidth>
                            {title && (
                                <FormLabel id={`${id}-titulo`} required={required} error={!!error} sx={{ mb: 1, fontWeight: 500, fontSize: '0.875rem' }}>
                                    {title}
                                </FormLabel>
                            )}
                            <Box
                                role='radiogroup'
                                aria-labelledby={title ? `${id}-titulo` : undefined}
                                aria-describedby={error ? `${id}-erro` : undefined}
                                aria-required={required || undefined}
                                aria-invalid={!!error || undefined}
                                aria-disabled={disabled || undefined}
                                onBlur={field.onBlur}
                                sx={{
                                    display: 'flex',
                                    flexDirection: row ? 'row' : 'column',
                                    gap: 1,
                                    flexWrap: 'wrap',
                                }}
                            >
                                {options.map((option, index) => {
                                    const isSelected = field.value === option.value
                                    return (
                                        <Box
                                            key={index}
                                            ref={(el: HTMLDivElement | null) => {
                                                opcoes.current[index] = el
                                            }}
                                            role='radio'
                                            aria-checked={isSelected}
                                            aria-disabled={disabled || undefined}
                                            // Só uma opção entra no Tab: a marcada, ou a primeira se nenhuma estiver.
                                            tabIndex={disabled ? -1 : index === (marcada >= 0 ? marcada : 0) ? 0 : -1}
                                            onKeyDown={(e) => aoTeclar(e, index, isSelected)}
                                            onClick={() => !disabled && field.onChange(isSelected && !required ? '' : option.value)}
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
                                                    backgroundColor: !disabled && !isSelected ? theme.palette.grey[50] : undefined,
                                                },
                                                // Só com foco do teclado: o clique não mostra o contorno.
                                                '&:focus-visible': {
                                                    outline: `2px solid ${theme.palette.primary.main}`,
                                                    outlineOffset: '2px',
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
                                                // MUI 9: o color do Typography só aceita nomes da paleta ('primary.main' e 'text.primary' viravam CSS inválido)
                                                color={isSelected ? 'primary' : 'textPrimary'}
                                                sx={{
                                                    fontWeight: isSelected ? 600 : 400,
                                                }}
                                            >
                                                {option.label}
                                            </Typography>
                                        </Box>
                                    )
                                })}
                            </Box>
                            {error && (
                                <FormHelperText
                                    id={`${id}-erro`}
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
                                    <ErrorOutlineOutlined fontSize='small' />
                                    {error.message}
                                </FormHelperText>
                            )}
                        </FormControl>
                    )
                }}
            />
        </Grid>
    )
}

export default React.memo(Radio)
