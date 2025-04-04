import { createContext, Dispatch, SetStateAction } from 'react'
import {
    Control,
    FieldErrors,
    FieldValues,
    UseFormGetValues,
    UseFormHandleSubmit,
    UseFormRegister,
    UseFormReset,
    UseFormSetValue,
    UseFormStateReturn,
    UseFormTrigger,
    UseFormUnregister,
    UseFormWatch,
} from 'react-hook-form'

export const FormContext = createContext<{
    formRegister: UseFormRegister<FieldValues>
    formWatch: UseFormWatch<FieldValues>
    formReset: UseFormReset<FieldValues>
    formSetValue: UseFormSetValue<FieldValues>
    formControl: Control<FieldValues, any>
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
    formState: UseFormStateReturn<FieldValues>
    errors: FieldErrors<FieldValues>
    submiting: boolean
} | null>(null)
