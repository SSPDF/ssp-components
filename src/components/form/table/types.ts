import { BoxProps } from '@mui/material'
import { ReactNode } from 'react'

export interface ColumnData<T> {
    title: string
    keyName: Partial<T>
    customComponent?: (content: string, obj: any) => JSX.Element
    size?: number
}

export interface OrderBy {
    label: string
    key: string
    type: 'string' | 'number'
}

/* -------------------------------------------------------------------------- */
/*                                   FILTRO                                   */
/* -------------------------------------------------------------------------- */

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
export interface GenericTableProps<T> {
    /**
     * Identificador único da tabela.
     */
    id: string

    /**
     * Configuração de largura para exibição em telas grandes.
     */
    mediaQueryLG?: {
        all: number
        action: number
    }

    /**
     * Funções de filtragem aplicáveis à tabela.
     */
    filtersFunc?: { [key: string]: (value: string) => any }

    /**
     * Lista de filtros disponíveis.
     */
    filters?: FilterValue[]

    /**
     * Configuração da ordenação das colunas.
     */
    orderBy?: OrderBy[]

    /**
     * Margem personalizada para o componente.
     */
    customMargin?: number

    /**
     * Margem personalizada para visualização em dispositivos móveis.
     */
    customMarginMobile?: number

    /**
     * Define se os valores CSV devem ser normalizados (removendo acentos, por exemplo).
     */
    normalize?: boolean

    /**
     * Define se os valores CSV devem ser convertidos para maiúsculas.
     */
    csvUpper?: boolean

    /**
     * Estilo personalizado para a tabela.
     */
    customTableStyle?: BoxProps

    /**
     * Caminho múltiplo para os dados dentro do JSON retornado pela API.
     */
    multipleDataPath?: string

    /**
     * Mensagem de erro personalizada para exibição na tabela.
     */
    customErrorMsg?: string | ReactNode

    /**
     * Remove aspas dos valores no CSV.
     */
    removeQuotes?: boolean

    /**
     * Lista de colunas a serem exibidas na tabela.
     */
    columns: ColumnData<T>[]

    /**
     * Nome da tabela para exibição.
     */
    tableName: string

    /**
     * Exibe botão para exportar todos os dados para CSV.
     */
    csvShowAllButton?: boolean

    /**
     * Lista de chaves que devem ser excluídas da exportação para CSV.
     */
    csvExcludeUpper?: string[]

    /**
     * Define se o CSV será exportado sem compactação.
     */
    csvWithoutZip?: boolean

    /**
     * Define o tamanho colapsado das células expansíveis.
     */
    collapsedSize?: number

    /**
     * Título do botão para exportação de todos os dados em CSV.
     */
    csvAllButtonTitle?: string

    /**
     * Título do botão para exportação em CSV.
     */
    csvButtonTitle?: string

    /**
     * Título do botão para exportação sem compactação.
     */
    csvNoZipText?: string

    /**
     * Chave usada para nomeação de arquivos CSV compactados.
     */
    csvZipFileNamesKey?: string

    /**
     * Define se será gerado um ZIP contendo os arquivos CSV.
     */
    generateCsvZip?: boolean

    /**
     * Função de validação para exclusão de chaves ao exportar CSV.
     */
    csvExcludeValidate?: (key: string, value: string | number) => boolean

    /**
     * Mapeamento de nomes personalizados para colunas do CSV.
     */
    csvCustomKeyNames?: { [key: string]: string }

    /**
     * Define o tamanho máximo do texto antes de ser colapsado.
     */
    expandTextMaxLength?: number

    /**
     * Lista de chaves a serem excluídas da exportação para CSV.
     */
    csvExcludeKeysCSV?: string[]

    /**
     * Lista de chaves a serem excluídas da exportação geral para CSV.
     */
    csvExcludeKeys?: string[]

    /**
     * Define se o título deve ser ocultado na exportação CSV.
     */
    hideTitleCSV?: boolean

    /**
     * Lista de chaves a serem excluídas na exportação de todos os dados.
     */
    csvExcludeKeysAll?: string[]

    /**
     * Nome da chave do status para identificação de status da linha.
     */
    statusKeyName?: string

    /**
     * Quantidade de itens por página.
     */
    itemCount?: number

    /**
     * Componente para exibir ações específicas para cada linha.
     */
    action: (prop: any) => JSX.Element

    /**
     * Configuração para exportação de arquivos CSV.
     */
    csv?: {
        fileName: string
    }

    /**
     * Define o número de colunas exibidas na tabela.
     */
    columnSize: number

    /**
     * Mensagens exibidas quando não há dados na tabela.
     */
    emptyMsg?: { user: string; public: string }

    /**
     * Caminho dentro do JSON de resposta onde os dados estão armazenados.
     */
    dataPath?: string

    /**
     * Define se a autenticação via Keycloak será utilizada.
     */
    useKC?: boolean

    /**
     * Dados da tabela
     */
    initialData: Array<Partial<T>> | null

    /**
     *  Variável para renderizar componente de carregamento
     */
    isLoading?: boolean
}
