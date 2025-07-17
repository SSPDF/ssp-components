import { Grid, InputLabel, TextField } from '@mui/material'
import get from 'lodash.get'
import React, { useContext, useEffect } from 'react'
import MaskInput from './MaskInput'
import { FormContext } from '../../../context/form'

export function Input({
    type = 'input',
    numberMask = '000000000000000',
    xs = 12,
    sm,
    inputMinLength = 1,
    inputMaxLength = 255,
    defaultValue = '',
    md,
    disabled = false,
    watchValue,
    ...props
}: {
    type: 'cnpj' | 'cpf' | 'input' | 'email' | 'cpf_cnpj' | 'phone' | 'input' | 'number' | 'rg' | 'password' | 'cep' | 'sei'
    name: string
    watchValue?: string
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
}) {
    const context = useContext(FormContext)!

    useEffect(() => {
        if (watchValue !== undefined) context.formSetValue(props.name, watchValue)
    }, [watchValue])

    const chooseInput = () => {
        const inputConfig: object = {
            fullWidth: true,
            size: 'small',
            placeholder: props.customPlaceholder ? props.customPlaceholder : props.title,
        }

        const name = props.name!
        const errorData = get(context?.errors, props.name!)
        const helperText: string = errorData?.message as string
        const error = errorData ? true : false

        const formConfig = {
            ...context?.formRegister(name, {
                validate: (v, f) => {
                    const value = v ?? ''

                    if (value.length <= 0 && props.required) return 'Este campo é obrigatório'

                    if (type === 'cnpj') {
                        if (value.length < 18 && props.required) return 'O CNPJ precisa ter no mínimo 14 dígitos'
                    }
                    //
                    else if (type === 'cpf') {
                        if (value.length < 14 && props.required) return 'O CPF precisa ter no mínimo 11 dígitos'
                    } //
                    else if (type === 'sei') {
                        if (value.length < 22 && props.required) return 'O Número SEI precisa ter no mínimo 19 dígitos'
                    }
                    //
                    else if (type === 'cep') {
                        if (value.length < 9 && props.required) return 'O CPF precisa ter no mínimo 8 dígitos'
                    }
                    //
                    else if (type === 'input' || type === 'password' || type === 'number') {
                        if (value.length > inputMaxLength) return `Limite máximo de ${inputMaxLength} caracteres`
                        if (value.length < inputMinLength && props.required) return `Limite mínimo de ${inputMinLength} caracteres`
                    }
                    //
                    else if (type === 'email') {
                        if (value.length > 50) return 'Limite máximo de 50 caracteres'
                        if (!/^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/g.test(v) && props.required) return 'O e-mail inserido não é valido'
                    }
                    //
                    else if (type === 'cpf_cnpj') {
                        if ((value.length < 14 || (value.length > 14 && value.length < 18)) && props.required) return 'O CPF/CNPJ precisa ter no mínimo 11/14 dígitos'
                    }
                    //
                    else if (type === 'phone') {
                        if (value.length < 14 && props.required) return 'O número precisa ter pelo menos 10 dígitos'
                    }
                },
            }),
            error,
            helperText,
            ...inputConfig,
            sx: {
                backgroundColor: 'white',
            },
        }

        switch (type) {
            case 'input':
            case 'email':
                return <TextField {...formConfig} defaultValue={defaultValue} disabled={disabled} />
            case 'password':
                return <TextField {...formConfig} type='password' disabled={disabled} />
            case 'number':
                return (
                    <MaskInput
                        formConfig={formConfig}
                        defaultValue={defaultValue}
                        maskProps={{
                            mask: numberMask,
                        }}
                        watchValue={watchValue}
                        disabled={disabled}
                    />
                )
            case 'cep':
                return (
                    <MaskInput
                        formConfig={formConfig}
                        defaultValue={defaultValue}
                        maskProps={{
                            mask: '00000-000',
                        }}
                        watchValue={watchValue}
                        disabled={disabled}
                    />
                )
            case 'phone':
                return (
                    <MaskInput
                        formConfig={formConfig}
                        defaultValue={defaultValue}
                        maskProps={{
                            mask: '(00) [#]0000-0000',
                            definitions: {
                                '#': /^9$/,
                            },
                        }}
                        watchValue={watchValue}
                        disabled={disabled}
                    />
                )
            case 'sei':
                return (
                    <MaskInput
                        formConfig={formConfig}
                        defaultValue={defaultValue}
                        maskProps={{
                            mask: '00000-00000000/0000-00',
                        }}
                        watchValue={watchValue}
                        disabled={disabled}
                    />
                )
            case 'cpf_cnpj':
                return (
                    <MaskInput
                        formConfig={formConfig}
                        defaultValue={defaultValue}
                        maskProps={{
                            mask: '000.000.000-00[0]',
                        }}
                        onMask={(value, setMask) => {
                            if (value.length > 14) setMask('00.000.000/0000-00')
                            else setMask('000.000.000-00[0]')
                        }}
                        watchValue={watchValue}
                        disabled={disabled}
                    />
                )
            case 'cpf':
                return (
                    <MaskInput
                        formConfig={formConfig}
                        defaultValue={defaultValue}
                        maskProps={{
                            mask: '000.000.000-00',
                        }}
                        watchValue={watchValue}
                        disabled={disabled}
                    />
                )
            case 'cnpj':
                return (
                    <MaskInput
                        formConfig={formConfig}
                        defaultValue={defaultValue}
                        maskProps={{
                            mask: '00.000.000/0000-00',
                        }}
                        watchValue={watchValue}
                        disabled={disabled}
                    />
                )
            case 'rg':
                return (
                    <MaskInput
                        formConfig={formConfig}
                        defaultValue={defaultValue}
                        maskProps={{
                            mask: '00000[000000]',
                        }}
                        watchValue={watchValue}
                        disabled={disabled}
                    />
                )
        }
    }

    return (
        <Grid item {...{ xs, sm, md }}>
            {props.title && (
                <InputLabel htmlFor='campo' required={props.required}>
                    {props.title}
                </InputLabel>
            )}
            {chooseInput()}
        </Grid>
    )
}

export default React.memo(Input)
