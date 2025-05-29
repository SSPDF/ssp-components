import { ToastContainer } from 'react-toastify'
import { CustomModalProvider } from '../modal/Modal'

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
