import { Grid, InputLabel, TextField, Box, SxProps, Theme } from '@mui/material'
import get from 'lodash.get'
import React, { useContext, useMemo } from 'react'
import MaskInput, { IMaskConfig } from './MaskInput'
import { FormContext } from '../../../context/form'
import { ErrorOutline } from '@mui/icons-material'

type InputType = 'cnpj' | 'cpf' | 'input' | 'email' | 'cpf_cnpj' | 'phone' | 'number' | 'rg' | 'password' | 'cep' | 'sei'

interface InputProps {
    type?: InputType
    name: string
    title?: string
    required?: boolean
    numberMask?: string
    customPlaceholder?: string
    defaultValue?: string
    inputMinLength?: number
    inputMaxLength?: number
    xs?: number
    sm?: number
    md?: number
    disabled?: boolean
    customValidate?: (value: string, form: Record<string, any>) => string | undefined
}

// Configurações de máscara por tipo
const MASK_CONFIGS: Record<string, IMaskConfig> = {
    cep: { mask: '00000-000' },
    phone: { mask: '(00) [9]0000-0000' },
    sei: { mask: '00000-00000000/0000-00' },
    cpf: { mask: '000.000.000-00' },
    cnpj: { mask: '00.000.000/0000-00' },
    rg: { mask: '00000[000000]' },
    cpf_cnpj: {
        mask: [{ mask: '000.000.000-00' }, { mask: '00.000.000/0000-00' }],
        dispatch: (appended: string, dynamicMasked: any) => {
            const number = (dynamicMasked.value + appended).replace(/\D/g, '')
            return dynamicMasked.compiledMasks[number.length > 11 ? 1 : 0]
        },
    },
}

// Validações por tipo
const VALIDATIONS: Record<string, { length: number; message: string }> = {
    cnpj: { length: 18, message: 'O CNPJ precisa ter no mínimo 14 dígitos' },
    cpf: { length: 14, message: 'O CPF precisa ter no mínimo 11 dígitos' },
    sei: { length: 22, message: 'O Número SEI precisa ter no mínimo 19 dígitos' },
    cep: { length: 9, message: 'O CEP precisa ter no mínimo 8 dígitos' },
    phone: { length: 14, message: 'O número precisa ter pelo menos 10 dígitos' },
}

// Estilos do campo
const textFieldSx: SxProps<Theme> = {
    backgroundColor: 'white',
    '& .MuiOutlinedInput-root': {
        borderRadius: '8px',
        transition: 'all 0.2s',
        '& fieldset': { borderColor: '#E0E0E0' },
        '&:hover fieldset': { borderColor: '#BDBDBD' },
        '&.Mui-focused fieldset': { borderColor: 'primary.main', borderWidth: '2px' },
        '&.Mui-error .MuiOutlinedInput-notchedOutline': { borderWidth: '2px' },
    },
}

const getHelperTextProps = (hasError: boolean): { sx: SxProps<Theme> } => ({
    sx: {
        backgroundColor: hasError ? '#FFEBEE' : 'transparent',
        borderRadius: '8px',
        padding: hasError ? '8px 12px' : 0,
        marginBottom: hasError ? '4px' : 0,
        marginTop: hasError ? '8px' : 0,
        border: hasError ? '1px solid #FFCDD2' : 'none',
        color: 'error.main',
        marginLeft: 0,
        marginRight: 0,
    },
})

export function Input({
    type = 'input',
    numberMask = '000000000000000',
    xs = 12,
    sm,
    md,
    inputMinLength = 1,
    inputMaxLength = 255,
    defaultValue = '',
    disabled = false,
    name,
    title,
    required,
    customPlaceholder,
    customValidate,
}: InputProps) {
    const context = useContext(FormContext)!

    const validate = (value: string | undefined, formData: Record<string, any>) => {
        const val = value ?? ''

        if (val.length === 0 && required) {
            return 'Este campo é obrigatório'
        }

        if (customValidate) {
            const customError = customValidate(val, formData)
            if (customError) return customError
        }

        // Validação por tipo com máscara
        const validation = VALIDATIONS[type]
        if (validation && val.length < validation.length && required) {
            return validation.message
        }

        // Validações específicas para tipos sem máscara
        if (type === 'input' || type === 'password' || type === 'number') {
            if (val.length > inputMaxLength) return `Limite máximo de ${inputMaxLength} caracteres`
            if (val.length < inputMinLength && required) return `Limite mínimo de ${inputMinLength} caracteres`
        }

        if (type === 'email') {
            if (val.length > 50) return 'Limite máximo de 50 caracteres'
            if (!/^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/g.test(val) && required) return 'O e-mail inserido não é válido'
        }

        if (type === 'cpf_cnpj') {
            const isInvalidLength = val.length < 14 || (val.length > 14 && val.length < 18)
            if (isInvalidLength && required) return 'O CPF/CNPJ precisa ter no mínimo 11/14 dígitos'
        }
    }

    const errorData = get(context.errors, name)
    const hasError = Boolean(errorData)

    const helperText = hasError ? (
        <Box component="span" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <ErrorOutline fontSize="small" />
            {errorData?.message as string}
        </Box>
    ) : undefined

    const formConfig = useMemo(() => ({
        ...context.formRegister(name, { validate }),
        error: hasError,
        helperText,
        fullWidth: true,
        size: 'small' as const,
        placeholder: customPlaceholder ?? title,
        FormHelperTextProps: getHelperTextProps(hasError),
        sx: textFieldSx,
    }), [name, hasError, helperText, customPlaceholder, title])

    const renderInput = () => {
        // Tipos sem máscara
        if (type === 'input' || type === 'email') {
            return <TextField {...formConfig} defaultValue={defaultValue} disabled={disabled} />
        }

        if (type === 'password') {
            return <TextField {...formConfig} type="password" disabled={disabled} />
        }

        // Tipos com máscara
        const maskConfig = type === 'number'
            ? { mask: numberMask }
            : MASK_CONFIGS[type]

        if (maskConfig) {
            return <MaskInput formConfig={formConfig} imaskConfig={maskConfig} disabled={disabled} />
        }

        return null
    }

    return (
        <Grid item xs={xs} sm={sm} md={md}>
            {title && (
                <InputLabel
                    required={required}
                    sx={{
                        mb: 1,
                        fontWeight: 500,
                        fontSize: '0.875rem',
                        color: 'text.primary',
                        transform: 'none',
                        position: 'static',
                    }}
                >
                    {title}
                </InputLabel>
            )}
            {renderInput()}
        </Grid>
    )
}

export default React.memo(Input)
