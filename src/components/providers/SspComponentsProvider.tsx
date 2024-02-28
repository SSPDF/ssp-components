import React from 'react'
import { ToastContainer } from 'react-toastify'

import { CustomModalProvider } from '../modal/Modal'

import 'react-toastify/dist/ReactToastify.css'

//components principal da aplicação
export function SspComponentsProvider(props: { children: JSX.Element | JSX.Element[] }) {
    return (
        <>
            <CustomModalProvider />
            {props.children}
            <ToastContainer position='bottom-right' theme='colored' />
        </>
    )
}
