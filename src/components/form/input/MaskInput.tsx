import { Button, TextField } from '@mui/material'
import React, { useCallback, useContext, useEffect, useRef, useState } from 'react'
import { IMaskInput, useIMask } from 'react-imask'
import { FormContext } from '../../../context/form'

export type IMaskConfig = Partial<React.ComponentProps<typeof IMaskInput>>

const TextMaskCustom = React.forwardRef<HTMLElement>(function TextMaskCustom(props: any, ref: any) {
    const { onChange, onMask, maskValue, setMaskValue, watchValue, imaskConfig, ...prop } = props
    const [mask, setMask] = useState(imaskConfig.mask)

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
            mask={mask}
            value={myValue}
            ref={myRef}
            inputRef={ref}
            onChange={(e) => { }}
            onAccept={(value, mask) => {
                setMyValue(value)
                mask.updateValue()

                if (!onMask) return

                onMask(value, setMask)
            }}
            {...imaskConfig}
        />
    )
})

export default function MaskInput(props: {
    formConfig: object
    defaultValue?: string
    disabled?: boolean
    watchValue?: string
    onMask?: (value: string, setMask: React.Dispatch<React.SetStateAction<string>>) => void
    imaskConfig?: IMaskConfig
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
                    inputProps: { onMask: props.onMask, maskValue, setMaskValue, watchValue: props.watchValue, imaskConfig: props.imaskConfig },
                }}
                disabled={props.disabled}
                fullWidth
            />
        </>
    )
}
