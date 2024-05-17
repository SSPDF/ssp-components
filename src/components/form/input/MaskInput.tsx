import { Button, TextField } from '@mui/material'
import React, { useCallback, useContext, useEffect, useRef, useState } from 'react'
import { IMaskInput, useIMask } from 'react-imask'
import { FormContext } from '../../../context/form'

const TextMaskCustom = React.forwardRef<HTMLElement>(function TextMaskCustom(props: any, ref: any) {
    const { onChange, maskProps, onMask, maskValue, setMaskValue, watchValue, ...prop } = props
    const [mask, setMask] = useState(maskProps.mask)

    delete prop.value

    const myRef = useRef<any | null>(null)
    const [myValue, setMyValue] = useState('')
    const context = useContext(FormContext)!

    useEffect(() => {
        if (watchValue) {
            setMyValue(watchValue)
        }
    }, [watchValue])

    useEffect(() => {
        context.formSetValue(prop.name, myRef.current.element.value)
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
                setMyValue(value)
                mask.updateValue()

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
    watchValue?: string
    onMask?: (value: string, setMask: React.Dispatch<React.SetStateAction<string>>) => void
}) {
    const context = useContext(FormContext)!
    const [maskValue, setMaskValue] = useState('')

    return (
        <>
            <TextField
                {...props.formConfig}
                onInput={(e) => {
                    const name = (props.formConfig as any).name as string
                    const value = (e.target as any).value

                    context.formSetValue(name, value)
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
