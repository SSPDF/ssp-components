import { Grid, InputLabel, TextField } from '@mui/material'
import get from 'lodash.get'
import React, { useCallback, useContext } from 'react'
import MaskInput from './MaskInput'
import { FormContext } from '../../../context/form'

export function Input({
    type = 'input',
    numberMask = '000000000000000',
    xs = 12,
    sm,
    inputMinLength = 3,
    inputMaxLength = 255,
    md,
    ...props
}: {
    type: 'cnpj' | 'cpf' | 'input' | 'email' | 'cpf_cnpj' | 'phone' | 'input' | 'number' | 'rg' | 'password' | 'cep'
    name: string
    title?: string
    required?: boolean
    numberMask?: string
    customPlaceholder?: string
    inputMinLength?: number
    inputMaxLength?: number
    xs?: number
    sm?: number
    md?: number
}) {
    const context = useContext(FormContext)

    const chooseInput = useCallback(() => {
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
                    if (v.length <= 0 && props.required) return 'Este campo é obrigatório'

                    if (type === 'cnpj') {
                        if (v.length < 18 && props.required) return 'O CNPJ precisa ter no mínimo 14 dígitos'
                    }
                    //
                    else if (type === 'cpf') {
                        if (v.length < 14 && props.required) return 'O CPF precisa ter no mínimo 11 dígitos'
                    }
                    //
                    else if (type === 'cep') {
                        if (v.length < 9 && props.required) return 'O CPF precisa ter no mínimo 8 dígitos'
                    }
                    //
                    else if (type === 'input' || type === 'password') {
                        if (v.length > inputMaxLength) return `Limite máximo de ${inputMaxLength} caracteres`
                        if (v.length < inputMinLength && props.required) return `Limite mínimo de ${inputMinLength} caracteres`
                    }
                    //
                    else if (type === 'email') {
                        if (v.length > 50) return 'Limite máximo de 50 caracteres'
                        if (!/^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/g.test(v) && props.required) return 'O e-mail inserido não é valido'
                    }
                    //
                    else if (type === 'cpf_cnpj') {
                        if ((v.length < 14 || (v.length > 14 && v.length < 18)) && props.required) return 'O CPF/CNPJ precisa ter no mínimo 11/14 dígitos'
                    }
                    //
                    else if (type === 'phone') {
                        if (v.length < 14 && props.required) return 'O número precisa ter pelo menos 10 dígitos'
                    }
                },
            }),
            error,
            helperText,
            ...inputConfig,
        }

        switch (type) {
            case 'input':
            case 'email':
                return <TextField {...formConfig} />
            case 'password':
                return <TextField {...formConfig} type='password' />
            case 'number':
                return (
                    <MaskInput
                        formConfig={formConfig}
                        maskProps={{
                            mask: numberMask,
                        }}
                    />
                )
            case 'cep':
                return (
                    <MaskInput
                        formConfig={formConfig}
                        maskProps={{
                            mask: '00000-000',
                        }}
                    />
                )
            case 'phone':
                return (
                    <MaskInput
                        formConfig={formConfig}
                        maskProps={{
                            mask: '(00) [#]0000-0000',
                            definitions: {
                                '#': /^9$/,
                            },
                        }}
                    />
                )
            case 'cpf_cnpj':
                return (
                    <MaskInput
                        formConfig={formConfig}
                        maskProps={{
                            mask: '000.000.000-00[0]',
                        }}
                        onMask={(value, setMask) => {
                            if (value.length > 14) setMask('00.000.000/0000-00')
                            else setMask('000.000.000-00[0]')
                        }}
                    />
                )
            case 'cpf':
                return (
                    <MaskInput
                        formConfig={formConfig}
                        maskProps={{
                            mask: '000.000.000-00',
                        }}
                    />
                )
            case 'cnpj':
                return (
                    <MaskInput
                        formConfig={formConfig}
                        maskProps={{
                            mask: '00.000.000/0000-00',
                        }}
                    />
                )
            case 'rg':
                return (
                    <MaskInput
                        formConfig={formConfig}
                        maskProps={{
                            mask: '00000[000000]',
                        }}
                    />
                )
        }
    }, [props, context, type])

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
