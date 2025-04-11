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

export interface CsvMapProps {
    name: string,
    key: string,
    useFilterValue?: {
        label: string,
        operators: FilterOperators[]
    }
}

export interface CsvConfigProp {
    fileName: string
    map: CsvMapProps[]
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

    /** Estilo customizado da tabela */
    customTableStyle?: BoxProps

    /** Mensagem de erro personalizada */
    customErrorMsg?: string | ReactNode

    /** Colunas da tabela */
    columns: any[]

    /** Nome da tabela */
    tableName: string

    csvConfig?: CsvConfigProp

    /** Altura da célula colapsada */
    collapsedSize?: number

    /** Validação para exclusão de chaves no CSV */
    csvExcludeValidate?: (key: string, value: string | number) => boolean

    /** Tamanho máximo do texto antes de colapsar */
    expandTextMaxLength?: number

    /** Ações por linha */
    action: (prop: any) => JSX.Element

    /** Configuração para exportação CSV */
    csv?: {
        fileName: string
    }

    /** Quantidade de itens por página */
    itemCount?: number

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
    initialData?: Array<{ [key: string]: any }> | null

    /** Flag de carregamento dos dados da tabela */
    isLoading?: boolean

    /** Flag para mostrar ou não o botão de expandir a Linha */
    isExpandable?: boolean
}
