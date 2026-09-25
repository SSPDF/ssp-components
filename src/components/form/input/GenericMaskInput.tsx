import { TextField } from '@mui/material'
import React, { useEffect, useRef, useState } from 'react'
import { IMaskInput } from 'react-imask'
import { useFormContext } from 'react-hook-form'

const TextMaskCustom = React.forwardRef<HTMLElement>(function TextMaskCustom(props: any, ref: any) {
    const { onChange, maskProps, onMask, maskValue, setMaskValue, watchValue, ...prop } = props
    const [mask, setMask] = useState(maskProps.mask)

    delete prop.value

    const myRef = useRef<any | null>(null)
    const [myValue, setMyValue] = useState('')
    const context = useFormContext()

    useEffect(() => {
        if (watchValue) {
            setMyValue(watchValue)
        }
    }, [watchValue])

    useEffect(() => {
        context.setValue(prop.name, myRef.current.element.value)
    }, [myValue])

    delete prop.watchValue

    return (
        <IMaskInput
            {...prop}
            {...maskProps}
            mask={mask}
            value={myValue}
            ref={myRef}
            inputRef={ref}
            onChange={(e) => {}}
            onAccept={(value, mask) => {
                setMyValue(value as string)
                mask.updateValue()

                if (!onMask) return

                onMask(value, setMask)
            }}
        />
    )
})

export default function GenericMaskInput(props: {
    formConfig: object
    defaultValue?: string
    maskProps: { mask: string | RegExp; definitions?: { [key: string]: string | RegExp } }
    disabled?: boolean
    watchValue?: string
    onMask?: (value: string, setMask: React.Dispatch<React.SetStateAction<string>>) => void
}) {
    // Contexto nativo do react-hook-form, como o `TextMaskCustom` acima e o resto da família
    // `Generic*`. Até a 0.1.x lia o `FormContext` customizado, que não existe sob o
    // `GenericFormProvider`: digitar quebrava no `onInput` (UPGRADE_PLAN.md 5.8b).
    const context = useFormContext()
    const [maskValue, setMaskValue] = useState('')

    return (
        <>
            <TextField
                {...props.formConfig}
                onInput={(e) => {
                    const name = (props.formConfig as any).name as string
                    const value = (e.target as any).value

                    context.setValue(name, value)
                }}
                InputProps={{
                    inputComponent: TextMaskCustom as any,
                    inputProps: { maskProps: props.maskProps, onMask: props.onMask, maskValue, setMaskValue, watchValue: props.watchValue },
                }}
                disabled={props.disabled}
                fullWidth
            />
        </>
    )
}
