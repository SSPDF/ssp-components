import { Grid, InputLabel, TextField, TextFieldProps } from '@mui/material'
import React, { FC } from 'react'
import MaskInput from './MaskInput'

type GenericInputProps = {
    type?: 'cnpj' | 'cpf' | 'input' | 'email' | 'cpf_cnpj' | 'phone' | 'number' | 'rg' | 'password' | 'cep' | 'sei'
    title?: string
    numberMask?: string
    customPlaceholder?: string
    inputMinLength?: number
    inputMaxLength?: number
    xs?: number
    sm?: number
    md?: number
    helperText?: string
} & Omit<TextFieldProps, 'type'>

const GenericInput: FC<GenericInputProps> = ({
    type = 'input',
    numberMask = '000000000000000',
    xs = 12,
    sm,
    inputMinLength = 1,
    inputMaxLength = 255,
    defaultValue = '',
    md,
    disabled = false,
    title,
    customPlaceholder,
    helperText,
    ...inputProps
}) => {
    const renderInputField = () => {
        const commonProps: TextFieldProps = {
            variant: 'outlined' as 'standard' | 'filled' | 'outlined',
            fullWidth: true,
            placeholder: customPlaceholder || title,
            defaultValue,
            disabled,
            helperText,
            sx: { backgroundColor: 'white' },
            ...inputProps,
        }

        const masks = {
            number: numberMask,
            cep: '00000-000',
            phone: '(00) [#]0000-0000',
            sei: '00000-00000000/0000-00',
            cpf_cnpj: '000.000.000-00[0]',
            cpf: '000.000.000-00',
            cnpj: '00.000.000/0000-00',
            rg: '00000[000000]',
        }

        if (['input', 'email', 'password'].includes(type)) {
            return <TextField {...commonProps} type={type === 'password' ? 'password' : 'text'} />
        }

        return (
            <MaskInput
                formConfig={commonProps}
                maskProps={{
                    mask: masks[type],
                    ...(type === 'cpf_cnpj' && {
                        onMask: (value, setMask) => {
                            setMask(value?.length > 14 ? '00.000.000/0000-00' : '000.000.000-00[0]')
                        },
                    }),
                }}
            />
        )
    }

    return (
        <Grid item {...{ xs, sm, md }}>
            {title && <InputLabel htmlFor={inputProps.id || inputProps.name}>{title}</InputLabel>}
            {renderInputField()}
        </Grid>
    )
}

export default React.memo(GenericInput)
