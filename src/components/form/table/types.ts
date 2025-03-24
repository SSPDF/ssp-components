import { BoxProps } from '@mui/material'
import { ReactNode } from 'react'

export interface ColumnData {
    title: string
    keyName: string
    customComponent?: (content: string, obj: any) => JSX.Element
    size?: number
}

export interface OrderBy {
    label: string
    key: string
    type: 'string' | 'number'
}

export type FilterType = 'string' | 'number' | 'date' | 'dates'
export type FilterOperators =
    | 'igual'
    | 'contem'
    | 'maior que'
    | 'menor que'
    | 'data exata'
    | 'após'
    | 'antes de'
    | 'entre'
    | 'tem um dos'
    | 'depois de'
    | 'antes de'
    | 'data inicio'
    | 'data fim'
    | 'tem a data'

export interface FilterValue {
    label: string
    keyName: string
    type: FilterType
    operator: FilterOperators
    operators: FilterOperators[]
    value: string | any
    value2?: string | any
    useList?: { id: string | number; label: string }[]
    customFunc?: string
}

/**
 * Interface para as propriedades do componente Table.
 */
export interface TableProps {
    /** ID único da tabela */
    id: string

    /** Configurações de largura para telas grandes */
    mediaQueryLG?: {
        all: number
        action: number
    }

    /** Funções de transformação para filtros */
    filtersFunc?: { [key: string]: (value: string) => any }

    /** Filtros disponíveis */
    filters?: FilterValue[]

    /** Ordenação por colunas */
    orderBy?: OrderBy[]

    /** Margem personalizada (desktop) */
    customMargin?: number

    /** Margem personalizada (mobile) */
    customMarginMobile?: number

    /** Normaliza textos (remove acentos) */
    normalize?: boolean

    /** Converte textos para maiúsculas */
    csvUpper?: boolean

    /** Estilo customizado da tabela */
    customTableStyle?: BoxProps

    /** Caminho múltiplo dentro dos dados */
    multipleDataPath?: string

    /** Mensagem de erro personalizada */
    customErrorMsg?: string | ReactNode

    /** Remove aspas dos valores no CSV */
    removeQuotes?: boolean

    /** Colunas da tabela */
    columns: any[]

    /** Nome da tabela */
    tableName: string

    /** Exibe botão para exportar todos os dados */
    csvShowAllButton?: boolean

    /** Chaves excluídas da exportação (upper) */
    csvExcludeUpper?: string[]

    /** Exporta CSV sem compactação */
    csvWithoutZip?: boolean

    /** Altura da célula colapsada */
    collapsedSize?: number

    /** Texto do botão "Exportar todos em CSV" */
    csvAllButtonTitle?: string

    /** Texto do botão "Exportar CSV" */
    csvButtonTitle?: string

    /** Texto do botão "Exportar sem ZIP" */
    csvNoZipText?: string

    /** Chave para nomear arquivos ZIP */
    csvZipFileNamesKey?: string

    /** Gera arquivo ZIP ao exportar */
    generateCsvZip?: boolean

    /** Validação para exclusão de chaves no CSV */
    csvExcludeValidate?: (key: string, value: string | number) => boolean

    /** Mapeia nomes customizados de colunas no CSV */
    csvCustomKeyNames?: { [key: string]: string }

    /** Tamanho máximo do texto antes de colapsar */
    expandTextMaxLength?: number

    /** Chaves excluídas da exportação CSV simples */
    csvExcludeKeysCSV?: string[]

    /** Chaves excluídas da exportação geral */
    csvExcludeKeys?: string[]

    /** Oculta o título na exportação CSV */
    hideTitleCSV?: boolean

    /** Chaves excluídas no CSV com todos os dados */
    csvExcludeKeysAll?: string[]

    /** Nome da chave para status da linha */
    statusKeyName?: string

    /** Quantidade de itens por página */
    itemCount?: number

    /** Ações por linha */
    action: (prop: any) => JSX.Element

    /** Configuração para exportação CSV */
    csv?: {
        fileName: string
    }

    /** Número de colunas da tabela */
    columnSize: number

    /** Função para buscar dados */
    fetchFunc?: () => Promise<Response>

    /** Mensagens para quando não há dados */
    emptyMsg?: { user: string; public: string }

    /** Caminho dos dados no JSON da resposta */
    dataPath?: string

    /** Usa autenticação via Keycloak */
    useKC?: boolean

    /** Dados iniciais da tabela */
    initialData: Array<{ [key: string]: any }> | null

    /** Flag de carregamento dos dados da tabela */
    isLoading?: boolean
}
