import React, { useContext, useEffect } from 'react'
import { FormContext } from '../../../context/form'

// Coloque esse componente dentro de um bloco que é retirado com o valor do input
export function ToggleVisibility({ invert = false, ...props }: { switchId: string; unregisterNameList: string[]; invert?: boolean }) {
    const context = useContext(FormContext)!

    useEffect(() => {
        return () => {
            if (context.formWatch(props.switchId) === invert) {
                props.unregisterNameList.forEach((x) => context.formUnregister(x))
            }
        }
    }, [])

    return <></>
}

export function SwitchWatch({ invert = false, ...props }: { children: JSX.Element | JSX.Element[]; switchId: string; unregisterNameList: string[]; invert?: boolean }) {
    const context = useContext(FormContext)!

    return (
        <>
            {context?.formWatch(props.switchId) !== invert && (
                <>
                    <ToggleVisibility switchId={props.switchId} unregisterNameList={props.unregisterNameList} invert={invert} />
                    {props.children}
                </>
            )}
        </>
    )
}
