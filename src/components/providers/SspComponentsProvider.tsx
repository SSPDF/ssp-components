import React from 'react'
import { ToastContainer } from 'react-toastify'

import { CustomModalProvider } from '../modal/Modal'

//components principal da aplicação
export function SspComponentsProvider(props: { children: React.JSX.Element | React.JSX.Element[] }) {
    return (
        <>
            <CustomModalProvider />
            {props.children}
            <ToastContainer position='bottom-right' theme='colored' />
        </>
    )
}
