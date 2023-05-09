import React, { ReactElement, useState } from 'react'
import { FieldValues, useForm } from 'react-hook-form'
import { FormContext } from '../../context/form'

export default function FormProvider({
    children,
    onSubmit,
    formMethod = 'GET',
    submiting = false,
}: {
    children: ReactElement | ReactElement[]
    onSubmit: (data: FieldValues) => void
    formMethod?: 'POST' | 'GET' | 'PUT' | 'DELETE' | 'UPDATE'
    submiting?: boolean
}) {
    const {
        register,
        handleSubmit,
        formState: { errors },
        reset,
        watch,
        trigger,
        setValue,
        unregister,
        getValues,
    } = useForm()

    const [filesUid, setFilesUid] = useState<
        {
            CO_SEQ_ARQUIVO: number
            CO_TIPO_ARQUIVO: number
        }[]
    >([])

    return (
        <FormContext.Provider
            value={{
                formRegister: register,
                formWatch: watch,
                formReset: reset,
                formSetValue: setValue,
                formTrigger: trigger,
                formUnregister: unregister,
                formGetValues: getValues,
                formHandleSubmit: handleSubmit,
                setFilesUid: setFilesUid,
                errors: errors,
                submiting: submiting,
            }}
        >
            <form method={formMethod} onSubmit={handleSubmit(onSubmit)}>
                {children}
            </form>
        </FormContext.Provider>
    )
}
