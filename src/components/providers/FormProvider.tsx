import React, { ReactElement, useState } from 'react'
import { Control, FieldValues, useForm, UseFormReturn } from 'react-hook-form'
import { FormContext } from '../../context/form'
import type { FilesID } from '../../types/form'
import { toast } from 'react-toastify'

interface FormProviderProps<T extends FieldValues> {
    children: ReactElement | ReactElement[]
    onSubmit: (data: T, filesUid: FilesID) => void
    formMethod?: 'POST' | 'GET' | 'PUT' | 'DELETE' | 'UPDATE'
    submiting?: boolean
}

export default function FormProvider<T extends FieldValues>({ children, onSubmit, formMethod = 'GET', submiting = false }: FormProviderProps<T>) {
    const { register, handleSubmit, control, formState, reset, watch, trigger, setValue, unregister, getValues } = useForm<T>()

    const [filesUid, setFilesUid] = useState<FilesID>([])

    return (
        <FormContext.Provider
            value={{
                formRegister: register as UseFormReturn<FieldValues>['register'], // Cast `register` to a compatible type
                formWatch: watch as UseFormReturn<FieldValues>['watch'], // Cast `watch` to a compatible type
                formReset: reset as UseFormReturn<FieldValues>['reset'], // Cast `reset` to a compatible type
                formControl: control as Control<FieldValues, any>,
                formSetValue: setValue as UseFormReturn<FieldValues>['setValue'], // Cast `setValue` to a compatible type
                formTrigger: trigger as UseFormReturn<FieldValues>['trigger'], // Cast `trigger` to a compatible type
                formUnregister: unregister as UseFormReturn<FieldValues>['unregister'], // Cast `unregister` to a compatible type
                formGetValues: getValues as UseFormReturn<FieldValues>['getValues'], // Cast `getValues` to a compatible type
                formHandleSubmit: handleSubmit as UseFormReturn<FieldValues>['handleSubmit'], // Cast `handleSubmit` to a compatible type
                setFilesUid: setFilesUid,
                formState: formState as UseFormReturn<FieldValues>['formState'],
                errors: formState?.errors,
                submiting: submiting,
            }}
        >
            <form
                method={formMethod}
                onSubmit={handleSubmit(
                    (data) => onSubmit(data, filesUid),
                    () =>
                        toast('Formulário incompleto! Verifique os campos marcados e tente novamente.', {
                            type: 'warning',
                            position: 'top-right',
                            theme: 'colored',
                        })
                )}
            >
                {children}
            </form>
        </FormContext.Provider>
    )
}
