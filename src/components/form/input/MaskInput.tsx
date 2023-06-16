import { TextField } from '@mui/material'
import React, { useCallback, useContext, useState } from 'react'
import { IMaskInput } from 'react-imask'
import { FormContext } from '../../../context/form'

const TextMaskCustom = React.forwardRef<HTMLElement>(function TextMaskCustom(props: any, ref: any) {
    const { onChange, maskProps, onMask, maskValue, setMaskValue, ...prop } = props
    const [mask, setMask] = useState(maskProps.mask)

    delete prop.value

    return (
        <IMaskInput
            {...prop}
            {...maskProps}
            mask={mask}
            inputRef={ref}
            onAccept={(value: string) => {
                setMaskValue(value)
                if (!onMask) return

                onMask(value, setMask)
            }}
        />
    )
})

export default function MaskInput(props: {
    formConfig: object
    defaultValue?: string
    maskProps: { mask: string | RegExp; definitions?: { [key: string]: string | RegExp } }
    disabled?: boolean
    onMask?: (value: string, setMask: React.Dispatch<React.SetStateAction<string>>) => void
}) {
    const context = useContext(FormContext)!
    const [inputValue, setInputValue] = React.useState('')
    const [maskValue, setMaskValue] = useState('')

    const onChangeInput = useCallback((e: React.FormEvent) => {
        setInputValue((e.target as HTMLInputElement).value)
    }, [])

    return (
        <TextField
            {...props.formConfig}
            value={inputValue}
            onInput={(e) => {
                const name = (props.formConfig as any).name as string
                const value = (e.target as any).value

                context.formSetValue(name, value)
            }}
            defaultValue={props.defaultValue}
            onFocus={(e) => setMaskValue(e.target.value)}
            onChange={onChangeInput}
            InputProps={{
                inputComponent: TextMaskCustom as any,
                inputProps: { maskProps: props.maskProps, onMask: props.onMask, maskValue, setMaskValue },
            }}
            disabled={props.disabled}
            fullWidth
        />
    )
}
