import React, { useContext, useEffect, useState } from 'react'
import { FormContext } from '../../../context/form'

// Coloque esse componente dentro de um bloco que é retirado com o valor do input
export function ToggleVisibility({ invert = false, hasCheckValue = false, ...props }: { switchId: string; unregisterNameList: string[]; invert?: boolean; hasCheckValue: boolean }) {
    const context = useContext(FormContext)!

    useEffect(() => {
        return () => {
            if (hasCheckValue ? invert : context.formWatch(props.switchId) === invert) {
                props.unregisterNameList.forEach((x) => context.formUnregister(x))
            }
        }
    }, [props.unregisterNameList])

    return <></>
}

export function SwitchWatch({
    invert = false,
    checkValue,
    ...props
}: {
    children: JSX.Element | JSX.Element[]
    switchId: string
    unregisterNameList: string[]
    invert?: boolean
    checkValue?: string | number
}) {
    const context = useContext(FormContext)!

    return (
        <>
            {(checkValue ? (context?.formWatch(props.switchId) === checkValue) !== invert : context?.formWatch(props.switchId) !== invert) && (
                <>
                    <ToggleVisibility
                        switchId={props.switchId}
                        unregisterNameList={props.unregisterNameList}
                        hasCheckValue={!!checkValue}
                        invert={checkValue ? (context?.formWatch(props.switchId) === checkValue) !== invert : invert}
                    />
                    {props.children}
                </>
            )}
        </>
    )
}
