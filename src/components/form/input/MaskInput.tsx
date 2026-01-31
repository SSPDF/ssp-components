import { TextField } from '@mui/material'
import React, { useContext, useEffect, useRef, useState } from 'react'
import { IMaskInput } from 'react-imask'
import { FormContext } from '../../../context/form'

export type IMaskConfig = Partial<React.ComponentProps<typeof IMaskInput>>

interface TextMaskCustomProps {
    name: string
    imaskConfig: IMaskConfig
    onMaskChange?: (value: string, setMask: React.Dispatch<React.SetStateAction<IMaskConfig['mask']>>) => void
    inputRef?: React.Ref<HTMLInputElement>
}

const TextMaskCustom = React.forwardRef<HTMLInputElement, TextMaskCustomProps>(
    function TextMaskCustom({ imaskConfig, onMaskChange, name, ...restProps }, ref) {
        const maskRef = useRef<any>(null)
        const [value, setValue] = useState('')
        const [mask, setMask] = useState<IMaskConfig['mask']>(imaskConfig.mask)
        const context = useContext(FormContext)!

        // Observa mudanças externas (ex: formReset)
        const formValue = context.formWatch(name)

        // Sincroniza quando o valor do form muda externamente
        useEffect(() => {
            if (formValue !== undefined && formValue !== value) {
                setValue(formValue)
            }
        }, [formValue])

        // Propaga o valor mascarado para o React Hook Form
        useEffect(() => {
            const maskedValue = maskRef.current?.maskRef?.value
            if (maskedValue !== undefined) {
                context.formSetValue(name, maskedValue)
            }
        }, [value, name])

        const MaskedInput = IMaskInput as any

        return (
            <MaskedInput
                {...restProps}
                {...imaskConfig}
                name={name}
                mask={mask}
                value={value}
                ref={maskRef}
                inputRef={ref}
                onAccept={(newValue: string, maskInstance: any) => {
                    setValue(newValue)
                    maskInstance.updateValue()
                    onMaskChange?.(newValue, setMask)
                }}
            />
        )
    }
)

interface MaskInputProps {
    formConfig: { name: string } & Record<string, any>
    defaultValue?: string
    disabled?: boolean
    imaskConfig: IMaskConfig
    onMaskChange?: (value: string, setMask: React.Dispatch<React.SetStateAction<IMaskConfig['mask']>>) => void
}

export default function MaskInput({ formConfig, disabled, imaskConfig, onMaskChange }: MaskInputProps) {
    return (
        <TextField
            {...formConfig}
            disabled={disabled}
            fullWidth
            InputProps={{
                inputComponent: TextMaskCustom as any,
                inputProps: {
                    imaskConfig,
                    onMaskChange,
                },
            }}
        />
    )
}
