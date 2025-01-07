import React, { ReactElement } from 'react'
import { FieldValues, FormProvider, useForm } from 'react-hook-form'

interface FormProviderProps<T extends FieldValues> {
    children: ReactElement | ReactElement[]
    onSubmit: (data: T) => void
    formMethod?: 'POST' | 'GET' | 'PUT' | 'DELETE' | 'UPDATE'
    submiting?: boolean
}

export default function GenericFormProvider<T extends FieldValues>({ children, onSubmit, formMethod = 'GET', submiting = false }: FormProviderProps<T>) {
    const methods = useForm<T>()

    return (
        <FormProvider {...methods}>
            <form onSubmit={methods.handleSubmit(onSubmit)}>{children}</form>
        </FormProvider>
    )
}
