import type { Context, Dispatch, SetStateAction } from 'react'
import { Control, FieldErrors, FieldValues, UseFormGetValues, UseFormRegister, UseFormReset, UseFormSetValue, UseFormTrigger, UseFormUnregister, UseFormWatch } from 'react-hook-form'

export enum FieldType {
    INPUT,
    MULT_INPUT,
    PHONE,
    CPF_CNPJ,
    CPF,
    CNPJ,
    RG,
    EMAIL,
    ACTIVE,
    CHECKBOX,
    CHECKBOX_WARNING,
    OTHER_CHECKBOX,
    LABEL,
    CUSTOM,
    FILE,
    MULT_FILE,
    DATE,
    TIME,
    NUMBER,
    AUTO_COMPLETE,
}

export enum ColumnDirection {
    ROW = 'row',
    COLUMN = 'column',
}

export interface FormField {
    type?: FieldType
    name?: string
    title?: string
    required?: boolean
    customPlaceholder?: string
    size?: number
    customForm?: React.ReactElement
    customData?: any
}

export interface FormData {
    title: string
    required: boolean
    formFields: FormField[]
    name?: string
}

export interface FormContextType {
    formRegister: UseFormRegister<FieldValues>
    formWatch: UseFormWatch<FieldValues>
    formReset: UseFormReset<FieldValues>
    formControl: Control<FieldValues, any>
    formSetValue: UseFormSetValue<FieldValues>
    formTrigger: UseFormTrigger<FieldValues>
    formUnregister: UseFormUnregister<FieldValues>
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
}

export type FilesID = {
    CO_SEQ_ARQUIVO: number
    CO_TIPO_ARQUIVO: number
}[]