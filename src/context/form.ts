import { createContext, Dispatch, SetStateAction } from 'react'
import { FieldErrors, FieldValues, UseFormRegister, UseFormReset, UseFormSetValue, UseFormTrigger, UseFormWatch } from 'react-hook-form'
import { UseFormGetValues, UseFormHandleSubmit, UseFormUnregister } from 'react-hook-form/dist/types'

export const FormContext = createContext<{
    formRegister: UseFormRegister<FieldValues>
    formWatch: UseFormWatch<FieldValues>
    formReset: UseFormReset<FieldValues>
    formSetValue: UseFormSetValue<FieldValues>
    formTrigger: UseFormTrigger<FieldValues>
    formUnregister: UseFormUnregister<FieldValues>
    formHandleSubmit: UseFormHandleSubmit<FieldValues>
    formGetValues: UseFormGetValues<FieldValues>
    setFilesUid: Dispatch<
        SetStateAction<
            {
                CO_SEQ_ARQUIVO: number
                CO_TIPO_ARQUIVO: number
            }[]
        >
    >
    errors: FieldErrors<FieldValues>
    submiting: boolean
} | null>(null)
