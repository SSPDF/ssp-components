import React, { ReactElement, useState } from 'react'
import { FieldValues, useForm } from 'react-hook-form'
import { FormContext } from '../../context/form'
import type { FilesID } from '../../types/form'
import { toast } from 'react-toastify'

export default function FormProvider({
    children,
    onSubmit,
    formMethod = 'GET',
    submiting = false,
}: {
    children: ReactElement | ReactElement[]
    onSubmit: (data: FieldValues, filesUid: FilesID) => void
    formMethod?: 'POST' | 'GET' | 'PUT' | 'DELETE' | 'UPDATE'
    submiting?: boolean
}) {
    const {
        register,
        handleSubmit,
        control,
        formState: { errors },
        reset,
        watch,
        trigger,
        setValue,
        unregister,
        getValues,
    } = useForm()

    const [filesUid, setFilesUid] = useState<FilesID>([])

    return (
        <FormContext.Provider
            value={{
                formRegister: register,
                formWatch: watch,
                formReset: reset,
                formControl: control,
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
            <form
                method={formMethod}
                onSubmit={handleSubmit(
                    (d) => onSubmit(d, filesUid),
                    (d) => toast('Formulário incompleto! Verifique os campos marcados e tente novamente.', { type: 'warning', position: 'top-right', theme: 'colored' })
                )}
            >
                {children}
            </form>
        </FormContext.Provider>
    )
}
