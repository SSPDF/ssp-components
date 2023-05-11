import React, { ReactElement, useState } from 'react'
import { FieldValues, useForm } from 'react-hook-form'
import { FormContext } from '../../context/form'
import type { FilesID } from '../../types/form'

export default function FormProvider({
    children,
    onSubmit,
    formMethod = 'GET',
    submiting = false,
}: {
    children: ReactElement | ReactElement[]
    onSubmit: (data: FieldValues, filesUid?: FilesID) => void
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

    const [filesId, setFilesUid] = useState<FilesID>([])

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
            <form method={formMethod} onSubmit={handleSubmit((d) => onSubmit(d, filesId))}>
                {children}
            </form>
        </FormContext.Provider>
    )
}
