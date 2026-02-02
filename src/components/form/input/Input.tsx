import { Grid, GridProps, InputLabel, InputLabelProps, TextField, TextFieldProps, Box, SxProps, Theme } from '@mui/material'
import get from 'lodash.get'
import React, { useContext, useMemo } from 'react'
import MaskInput, { IMaskConfig } from './MaskInput'
import { FormContext } from '../../../context/form'
import { ErrorOutline } from '@mui/icons-material'

// Tipos nativos do HTML input
type HTMLInputType = React.InputHTMLAttributes<HTMLInputElement>['type']

// Tipos customizados com máscara
export type MaskedInputType = 'cnpj' | 'cpf' | 'cpf_cnpj' | 'phone' | 'number' | 'rg' | 'cep' | 'sei'

// Tipos suportados: customizados + nativos do HTML
export type InputType = MaskedInputType | HTMLInputType

// Props que controlamos internamente e não devem ser sobrescritas
type OmittedTextFieldProps = 'name' | 'type' | 'value' | 'onChange' | 'error' | 'helperText' | 'fullWidth' | 'size' | 'placeholder'

// Props específicas do nosso Input
interface InputOwnProps {
    /** Tipo do campo - define máscara e validação */
    type?: InputType
    /** Nome do campo no formulário (obrigatório) */
    name: string
    /** Label exibido acima do campo */
    title?: string
    /** Campo obrigatório */
    required?: boolean
    /** Máscara customizada para type="number" */
    numberMask?: string
    /** Placeholder customizado (sobrescreve title) */
    customPlaceholder?: string
    /** Valor inicial do campo */
    defaultValue?: string
    /** Tamanho mínimo para validação (type="input") */
    inputMinLength?: number
    /** Tamanho máximo para validação (type="input") */
    inputMaxLength?: number
    /** Validação customizada */
    customValidate?: (value: string, form: Record<string, any>) => string | undefined
    /** Props do Grid container */
    gridProps?: Omit<GridProps, 'item' | 'xs' | 'sm' | 'md'>
    /** Props do InputLabel */
    labelProps?: Omit<InputLabelProps, 'required'>
}

// Props de layout do Grid
interface GridLayoutProps {
    xs?: GridProps['xs']
    sm?: GridProps['sm']
    md?: GridProps['md']
}

// Props completas: nossas props + TextField props (exceto as controladas) + Grid layout
export type InputProps = InputOwnProps & GridLayoutProps & Omit<TextFieldProps, OmittedTextFieldProps | keyof InputOwnProps>

// Configurações de máscara por tipo
const MASK_CONFIGS: Record<string, IMaskConfig> = {
    cep: { mask: '00000-000' },
    phone: {
        mask: [
            { mask: '(00) 0000-0000' }, // Fixo
            { mask: '(00) 00000-0000' } // Celular (Genérico é melhor que forçar o 9 fixo na string)
        ],
        dispatch: (appended: any, dynamicMasked: any) => {
            const number = (dynamicMasked.value + appended).replace(/\D/g, '')

            // Se ainda estiver digitando o DDD ou vazio, mantém máscara padrão (fixo)
            if (number.length <= 2) {
                return dynamicMasked.compiledMasks[0]
            }

            // Pega o terceiro dígito (logo após o DDD)
            const thirdDigit = number.substring(2, 3)

            // No Brasil, APENAS celulares começam com 9. Fixos começam com 2, 3, 4 ou 5.
            // Se o dígito for 9, forçamos a máscara de celular
            if (thirdDigit === '9') {
                return dynamicMasked.compiledMasks[1]
            }

            return dynamicMasked.compiledMasks[0]
        }
    },
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
}

// Estilos base do campo
const baseTextFieldSx: SxProps<Theme> = {
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

const getHelperTextProps = (hasError: boolean): TextFieldProps['FormHelperTextProps'] => ({
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

const baseLabelSx: SxProps<Theme> = {
    mb: 1,
    fontWeight: 500,
    fontSize: '0.875rem',
    color: 'text.primary',
    transform: 'none',
    position: 'static',
}

export function Input({
    // Props específicas
    type = 'input',
    name,
    title,
    required,
    numberMask = '000000000000000',
    customPlaceholder,
    defaultValue = '',
    inputMinLength = 1,
    inputMaxLength = 255,
    customValidate,
    // Props de layout
    xs = 12,
    sm,
    md,
    gridProps,
    labelProps,
    // Props do TextField repassadas
    disabled = false,
    sx,
    InputProps: inputPropsFromUser,
    InputLabelProps: inputLabelPropsFromUser,
    ...textFieldProps
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

        // Validação para tipos com máscara
        const validation = VALIDATIONS[type as string]
        if (validation && val.length < validation.length && required) {
            return validation.message
        }

        // Validação de tamanho para tipos de texto
        const textTypes = ['input', 'text', 'password', 'search', 'tel', 'url']
        if (textTypes.includes(type as string) || type === 'number') {
            if (val.length > inputMaxLength) return `Limite máximo de ${inputMaxLength} caracteres`
            if (val.length < inputMinLength && required) return `Limite mínimo de ${inputMinLength} caracteres`
        }

        // phone validation
        if (type === 'phone') {
            const cleanValue = val.replace(/\D/g, '')
            if (cleanValue.length > 2) {
                const thirdDigit = cleanValue.substring(2, 3)
                if (thirdDigit === '9') {
                    // mobile number validation
                    if (val.length < 15 && required) return 'O número de celular precisa ter 11 dígitos'
                } else {
                    // fixed number validation
                    if (val.length < 14 && required) return 'O número fixo precisa ter 10 dígitos'
                }
            } else {
                if (val.length < 14 && required) return 'O número precisa ter pelo menos 10 dígitos'
            }
        }

        // Validação de email
        if (type === 'email') {
            if (val.length > 50) return 'Limite máximo de 50 caracteres'
            if (!/^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/g.test(val) && required) return 'O e-mail inserido não é válido'
        }

        // Validação de CPF/CNPJ dinâmico
        if (type === 'cpf_cnpj') {
            const isInvalidLength = val.length < 14 || (val.length > 14 && val.length < 18)
            if (isInvalidLength && required) return 'O CPF/CNPJ precisa ter no mínimo 11/14 dígitos'
        }
    }

    const errorData = get(context.errors, name)
    const hasError = Boolean(errorData)
    const formValue = context.formWatch(name)

    const helperText = hasError ? (
        <Box component='span' sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <ErrorOutline fontSize='small' />
            {errorData?.message as string}
        </Box>
    ) : undefined

    // Merge de estilos: base + usuário
    const mergedSx = useMemo(() => (sx ? [baseTextFieldSx, sx].flat() : baseTextFieldSx), [sx])

    const formConfig = useMemo(
        () => ({
            ...context.formRegister(name, { validate }),
            error: hasError,
            helperText,
            fullWidth: true,
            size: 'small' as const,
            variant: 'outlined' as const,
            placeholder: customPlaceholder ?? title,
            FormHelperTextProps: getHelperTextProps(hasError),
            sx: mergedSx,
            InputProps: inputPropsFromUser,
            InputLabelProps: inputLabelPropsFromUser,
            ...textFieldProps,
        }),
        [name, hasError, helperText, customPlaceholder, title, mergedSx, inputPropsFromUser, inputLabelPropsFromUser, textFieldProps],
    )

    const renderInput = () => {
        // Tipos com máscara customizada
        const maskConfig = type === 'number' ? { mask: numberMask } : MASK_CONFIGS[type as string]

        if (maskConfig) {
            return <MaskInput formConfig={formConfig} imaskConfig={maskConfig} disabled={disabled} />
        }

        // Tipos nativos do HTML (text, email, password, tel, url, search, etc.)
        // 'input' é tratado como 'text' para compatibilidade
        const htmlType = type === 'input' ? 'text' : type

        return (
            <TextField
                {...formConfig}
                type={htmlType}
                value={formValue ?? defaultValue}
                onChange={(e) => context.formSetValue(name, e.target.value)}
                disabled={disabled}
            />
        )
    }

    return (
        <Grid item xs={xs} sm={sm} md={md} {...gridProps}>
            {title && (
                <InputLabel required={required} sx={labelProps?.sx ? [baseLabelSx, labelProps.sx].flat() : baseLabelSx} {...labelProps}>
                    {title}
                </InputLabel>
            )}
            {renderInput()}
        </Grid>
    )
}

export default React.memo(Input)
