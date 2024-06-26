import AddIcon from '@mui/icons-material/Add'
import FileDownloadIcon from '@mui/icons-material/FileDownload'
import SearchIcon from '@mui/icons-material/Search'
import {
    Autocomplete,
    AutocompleteProps,
    Box,
    Button,
    CircularProgress,
    Collapse,
    IconButton,
    LinearProgress,
    Link,
    List,
    ListItemButton,
    ListItemIcon,
    ListItemText,
    Menu,
    MenuItem,
    PaginationItem,
    Paper,
    Stack,
    SwipeableDrawer,
    Tooltip,
    useMediaQuery,
    useTheme,
} from '@mui/material'
import Grid from '@mui/material/Grid'
import Pagination from '@mui/material/Pagination'
import TextField from '@mui/material/TextField'
import Typography from '@mui/material/Typography'
import get from 'lodash.get'
import React, { ChangeEvent, ReactNode, useCallback, useContext, useEffect, useState } from 'react'
import { AuthData } from '../../../types/auth'
import { AuthContext } from '../../../context/auth'
import {
    Add,
    CalendarToday,
    Check,
    Circle,
    Delete,
    ExpandLess,
    ExpandMore,
    FilterAlt,
    FilterList,
    HorizontalRule,
    KeyboardArrowDown,
    KeyboardArrowUp,
    Label,
    North,
    RestartAlt,
    South,
    Title,
    ViewList,
} from '@mui/icons-material'
import FormProvider from '../../providers/FormProvider'
import { Input } from '../input/Input'
import DatePicker from '../date/DatePicker'
import dayjs from 'dayjs'
import JSZip from 'jszip'
import NavigateNextRoundedIcon from '@mui/icons-material/NavigateNextRounded'
import axios from 'axios'
import hasIn from 'lodash.hasin'

function removePunctuationAndAccents(text: string) {
    // Remove accents and diacritics
    const normalizedText = text.normalize('NFD').replace(/[\u0300-\u036f]/g, '')

    // Remove punctuation marks
    const cleanedText = normalizedText.replace(/[!"#$%&'()*+,\-./:;<=>?@[\\\]^_`{|}~]/g, '')

    return cleanedText
}

interface ColumnData {
    title: string
    keyName: string
    customComponent?: (content: string, obj: any) => JSX.Element
    size?: number
}

type FilterTypes = 'a-z' | 'z-a' | 'items' | 'date-interval' | 'data-a-z' | 'data-z-a' | 'select'

let startData: any[] = []
let isExpandAll: boolean = false

export function Table({
    mediaQueryLG,
    columns,
    fetchFunc,
    emptyMsg = {
        user: 'Nenhum dado encontrado',
        public: 'Nenhum dado encontrado',
    },
    dataPath = '',
    tableName = 'Dados',
    csv,
    columnSize,
    action,
    useKC = true,
    statusKeyName = '',
    csvExcludeKeys = [],
    csvExcludeKeysCSV = [],
    csvExcludeKeysAll = [],
    csvCustomKeyNames = {},
    csvExcludeValidate = (key, value) => false,
    csvButtonTitle = 'Salvar .CSV',
    csvNoZipText = 'Salvar .CSV',
    csvAllButtonTitle = 'Salvar todos em CSV',
    removeQuotes = false,
    normalize = false,
    csvShowAllButton = false,
    csvWithoutZip = false,
    itemCount = 10,
    csvUpper = false,
    csvZipFileNamesKey = '',
    generateCsvZip = false,
    filters = {},
    hideTitleCSV = false,
    csvExcludeUpper = [],
    filterSeparator = '|',
    filterStorageName = 'tableFilters',
    multipleDataPath = '',
    expandTextMaxLength = 50,
    collapsedSize = 53,
    customMargin = 4,
    customMarginMobile = 0,
}: {
    mediaQueryLG?: {
        all: number
        action: number
    }
    customMargin?: number
    customMarginMobile?: number
    normalize?: boolean
    csvUpper?: boolean
    multipleDataPath?: string
    filterStorageName?: string
    removeQuotes?: boolean
    columns: ColumnData[]
    tableName: string
    csvShowAllButton?: boolean
    csvExcludeUpper?: string[]
    csvWithoutZip?: boolean
    collapsedSize?: number
    csvAllButtonTitle?: string
    csvButtonTitle?: string
    csvNoZipText?: string
    csvZipFileNamesKey?: string
    generateCsvZip?: boolean
    csvExcludeValidate?: (key: string, value: string | number) => boolean
    csvCustomKeyNames?: {
        [key: string]: string
    }
    expandTextMaxLength?: number
    csvExcludeKeysCSV?: string[]
    csvExcludeKeys?: string[]
    hideTitleCSV?: boolean
    csvExcludeKeysAll?: string[]
    statusKeyName?: string
    itemCount?: number
    action: (prop: any) => JSX.Element
    csv?: {
        fileName: string
    }
    columnSize: number
    fetchFunc: () => Promise<Response>
    emptyMsg?: { user: string; public: string }
    dataPath?: string
    useKC?: boolean
    filters?: {
        [key: string]: {
            type: FilterTypes
            keyName: string
            name: string
            listEndpoint?: string
            selectList?: string[]
            referenceKey?: string
            options?: { name: string; color: string; key: string }[]
        }[]
    }
    filterSeparator?: string
}) {
    const [isLoading, setIsLoading] = useState(true)
    const [error, setError] = useState<null | { status: number }>(null)
    const [data, setData] = useState<any>(null)

    const { user, userLoaded } = useContext(AuthContext)
    const [list, setList] = useState<any[]>([])
    //numero de items pra ser mostrado
    const [itemsCount, setItemsCount] = useState(itemCount)
    const [currentPage, setCurrentPage] = useState(0)
    const [paginationCount, setPagCount] = useState(1)
    const [listPage, setListPage] = useState(1)
    const [appliedFilters, setAppliedFilters] = useState<any[]>([])
    const [oldSelectState, setOldSelectState] = useState<string>('')
    const [expandObj, setExpandObj] = useState<{ [key: number]: boolean }>({})
    const [showExpandObj, setShowExpandObj] = useState<{ [key: number]: boolean }>({})
    const [showExpandObjOnExited, setShowExpandObjOnExited] = useState<{ [key: number]: boolean }>({})

    // filters states
    const [filterCollapse, setFilterCollapse] = useState<boolean[]>(Array(Object.keys(filters).length).fill(false))
    const [filterOpen, setFilterOpen] = useState(false)
    const theme = useTheme()
    const isSmall = useMediaQuery(theme.breakpoints.only('xs'))

    const lg = useMediaQuery(theme.breakpoints.up(2000))

    useEffect(() => {
        setError(null)

        if (userLoaded || !useKC) {
            setIsLoading(true)

            fetchFunc()
                .then((res) => {
                    if (!res.ok) {
                        setError({
                            status: 500,
                        })
                        setIsLoading(false)
                        return
                    }

                    return res.json().then((j) => {
                        if (j.statusCode === 204) {
                            setData({ body: { data: [] } })
                            startData = []
                        } else if (j.statusCode === 403)
                            setError({
                                status: j.statusCode,
                            })
                        else {
                            let value = dataPath ? get(j, dataPath) : j

                            if (!value || !Array.isArray(value)) {
                                setData({ body: { data: [] } })
                                startData = []
                            } else {
                                setData(value)
                                startData = JSON.parse(JSON.stringify(value))
                                const oldFilters = localStorage.getItem(filterStorageName)

                                if (oldFilters) {
                                    const filters = JSON.parse(oldFilters)

                                    setAppliedFilters(filters)
                                }
                            }
                        }

                        setIsLoading(false)
                    })
                })
                .catch((err) => {
                    setError({
                        status: 500,
                    })
                })
        }
    }, [userLoaded, fetchFunc])

    const getCount = useCallback(
        (countData: any[]) => {
            if (countData.length <= 0) return 1

            let count = countData.length / itemsCount
            count = count < 1 ? 1 : count
            return Math.ceil(count)
        },
        [itemsCount]
    )

    const getData = useCallback((dt: any) => {
        if (Array.isArray(dt)) return dt

        if (typeof dt === 'object') return get(dt, dataPath)
    }, [])

    useEffect(() => {
        if (isLoading || error || !getData(data)) return

        setList(getData(data))
        setPagCount(getCount(getData(data)))
    }, [itemsCount, isLoading, data, getCount, error])

    useEffect(() => {
        setCurrentPage(listPage - 1)
    }, [listPage])

    const onPaginationChange = useCallback((e: ChangeEvent<unknown>, page: number) => {
        setListPage(page)
    }, [])

    const onInputChange = useCallback(
        (e: ChangeEvent) => {
            const searchValue = (e.target as HTMLInputElement).value

            if (searchValue === '') {
                setList(getData(data))
                setPagCount(getCount(getData(data)))
                return
            }

            const listData: object[] = getData(data)

            const newList: any = []

            listData.forEach((x: any) => {
                const dataStr: string[] = []

                Object.keys(x).map((key: string) => {
                    let value = get(x, key, '') ?? ''

                    if (typeof value === 'number') value = value.toString()
                    if (typeof value !== 'string') return

                    dataStr.push(value)
                })

                if (dataStr.length <= 0) return

                let exists = false

                dataStr.forEach((key) => {
                    const status = ['P', 'C', 'A', 'R', 'L', 'PA']

                    if (status.includes(key)) {
                        switch (key) {
                            case 'P':
                                if ('em analise'.includes(searchValue.toLowerCase())) {
                                    exists = true
                                }
                                return
                            case 'C':
                                if ('cancelado'.includes(searchValue.toLowerCase())) {
                                    exists = true
                                }
                                return
                            case 'A':
                                if ('cadastrado'.includes(searchValue.toLowerCase())) {
                                    exists = true
                                }
                                return
                            case 'R':
                                if ('reprovado'.includes(searchValue.toLowerCase())) {
                                    exists = true
                                }
                                return
                            case 'L':
                                if ('licenciado'.includes(searchValue.toLowerCase())) {
                                    exists = true
                                }
                                return
                            case 'PA':
                                if ('pré aprovado'.includes(searchValue.toLowerCase()) || 'pre aprovado'.includes(searchValue.toLowerCase())) {
                                    exists = true
                                }
                                return
                            case 'FP':
                                if ('fora do prazo'.includes(searchValue.toLowerCase())) {
                                    exists = true
                                }
                                return
                        }
                    }

                    if (removePunctuationAndAccents(key.toLowerCase()).includes(removePunctuationAndAccents(searchValue.toLowerCase()))) {
                        exists = true
                    }
                })

                if (!exists) return

                newList.push(x)
            })

            setList(newList)
            setPagCount(getCount(newList))
            setCurrentPage(0)
            setListPage(1)
        },
        [getCount, data]
    )

    const getMaxItems = useCallback(() => {
        const start = currentPage * itemsCount
        return list.slice(start, start + itemsCount)
    }, [list, itemsCount, currentPage])

    function defineCSVCells(key: any, cell: any): string {
        if (typeof cell === 'string') {
            let item = csvUpper && !csvExcludeUpper.includes(key) ? (cell as string).toUpperCase() : cell

            item = normalize ? item.normalize('NFD').replace(/[\u0300-\u036f]/g, '') : item

            return removeQuotes ? `${item}` : `"${item}"`
        } else if (typeof cell === 'object' && !Array.isArray(cell) && cell !== null) {
            let strItemAsObject = transformArrayObjectInString(cell).slice(1, -1) // key: label (Ex.: jsNaturezaEvento)

            let item = csvUpper && !csvExcludeUpper.includes(key) ? (strItemAsObject as string).toUpperCase() : strItemAsObject

            item = normalize ? item.normalize('NFD').replace(/[\u0300-\u036f]/g, '') : item

            return removeQuotes ? `${item}` : `"${item}"`
        }

        return cell
    }

    // download file
    const downloadCSV = useCallback(
        (e: React.MouseEvent, zip = false) => {
            e.preventDefault()

            if (list.length <= 0) return

            const originalKeys = Object.keys(list[0])

            if (generateCsvZip && zip) {
                const keys = originalKeys.filter((k) => !csvExcludeKeys.includes(k))
                const header = keys.map((k) => (csvCustomKeyNames[k] ? csvCustomKeyNames[k] : k)).join(',') + '\n'
                const zip = new JSZip()

                const obj: any = {}

                list.forEach((x: any) => {
                    if (!obj[x[csvZipFileNamesKey]]) obj[x[csvZipFileNamesKey]] = []

                    obj[x[csvZipFileNamesKey]].push(x)
                })

                Object.keys(obj).forEach((objKey: string) => {
                    const values: string[] = []

                    obj[objKey].forEach((x: any) => {
                        let include = true

                        originalKeys.forEach((k: string) => {
                            //verificar se pode incluir
                            if (csvExcludeValidate(k, x[k])) {
                                include = false
                            }
                        })

                        if (include) {
                            const value = keys
                                .map((k: string) => {
                                    if (typeof x[k] === 'string') {
                                        let item = csvUpper ? (x[k] as string).toUpperCase() : x[k]

                                        item = normalize ? item.normalize('NFD').replace(/[\u0300-\u036f]/g, '') : item

                                        return removeQuotes ? `${item}` : `"${item}"`
                                    } else if (typeof x[k] === 'object' && !Array.isArray(x[k]) && x[k] !== null) {
                                        let strItemAsObject = transformArrayObjectInString(x[k]).slice(1, -1) // k: label (Ex.: jsNaturezaEvento)

                                        let item = csvUpper && !csvExcludeUpper.includes(k) ? (strItemAsObject as string).toUpperCase() : strItemAsObject

                                        item = normalize ? item.normalize('NFD').replace(/[\u0300-\u036f]/g, '') : item

                                        return removeQuotes ? `${item}` : `"${item}"`
                                    }

                                    return x[k]
                                })
                                .join(',')

                            values.push(value)
                        }
                    })

                    const csvData = hideTitleCSV ? values.join('\n') : '\uFEFF' + header + values.join('\n')

                    if (values.length > 0) zip.file(`${objKey.normalize('NFD').replace(/[\u0300-\u036f]/g, '')}.csv`, csvData)
                })

                // // download
                var link = window.document.createElement('a')

                zip.generateAsync({ type: 'base64' }).then((base) => {
                    link.setAttribute('href', 'data:application/zip;base64,' + base)
                    link.setAttribute('download', `${csv?.fileName}.zip`)
                    link.click()
                })
            } else {
                let keys = originalKeys
                    .filter((k) => !csvExcludeKeysCSV.includes(k))
                    .map((k) => {
                        if (k === multipleDataPath) {
                            return 'hrTermino'
                        }

                        return k
                    })

                if (multipleDataPath !== '') {
                    keys = ['dtInicio', 'hrInicio', ...keys]
                }

                const header = keys.map((k) => (csvCustomKeyNames[k] ? csvCustomKeyNames[k] : k)).join(',') + '\n'
                const values: string[] = []

                list.forEach((x: any) => {
                    let include = true

                    originalKeys.forEach((k: string) => {
                        //verificar se pode incluir
                        if (csvExcludeValidate(k, x[k])) {
                            include = false
                        }
                    })

                    if (include) {
                        const value = keys
                            .map((k: string) => {
                                if (k === 'dtInicio') return '{dtInicio}'
                                else if (k === 'hrInicio') return '{hrInicio}'
                                else if (k === 'hrTermino') return '{hrTermino}'
                                else {
                                    if (typeof x[k] === 'string') {
                                        let item = csvUpper && !csvExcludeUpper.includes(k) ? (x[k] as string).toUpperCase() : x[k]

                                        item = normalize ? item.normalize('NFD').replace(/[\u0300-\u036f]/g, '') : item

                                        return removeQuotes ? `${item}` : `"${item}"`
                                    } else if (typeof x[k] === 'object' && !Array.isArray(x[k]) && x[k] !== null) {
                                        let strItemAsObject = transformArrayObjectInString(x[k]).slice(1, -1) // k: label (Ex.: jsNaturezaEvento)

                                        let item = csvUpper && !csvExcludeUpper.includes(k) ? (strItemAsObject as string).toUpperCase() : strItemAsObject

                                        item = normalize ? item.normalize('NFD').replace(/[\u0300-\u036f]/g, '') : item

                                        return removeQuotes ? `${item}` : `"${item}"`
                                    }

                                    return x[k]
                                }
                            })
                            .join(',')

                        if (multipleDataPath !== '') {
                            const dates = x[multipleDataPath]

                            if (dates) {
                                ;(dates as any[]).forEach((d) => {
                                    values.push(value.replace('{dtInicio}', d.dtInicio).replace('{hrInicio}', d.hrInicio).replace('{hrTermino}', d.hrTermino))
                                })
                            }
                        } else {
                            values.push(value)
                        }
                    }
                })

                const csvData = header + values.join('\n')

                // download
                var link = window.document.createElement('a')
                link.setAttribute('href', 'data:text/csv;charset=utf-8,%EF%BB%BF' + encodeURI(csvData))
                link.setAttribute('download', `${csv?.fileName}.csv`)
                link.click()
            }
        },
        [list]
    )

    function transformArrayObjectInString(o: Object): String {
        let arrString = []

        if (typeof o === 'object' && !Array.isArray(o) && o !== null) {
            for (let [key, value] of Object.entries(o)) {
                if (typeof value === 'object' && !Array.isArray(value) && value !== null) {
                    arrString.push(key + ': ' + transformArrayObjectInString(value))
                } else {
                    if (value) {
                        // Is true
                        arrString.push(key)
                    }
                }
            }
        }

        return '[' + arrString.join(' - ') + ']'
    }

    const downloadCSVAll = useCallback(
        (e: React.MouseEvent) => {
            e.preventDefault()

            if (list.length <= 0) return

            const keys = Object.keys(list[0]).filter((k) => !csvExcludeKeysAll.includes(k))
            const header = keys.join(',') + '\n'

            const values = list
                .map((x: any) => {
                    return keys
                        .map((k: string) => {
                            if (k === 'tbRa') return x[k]['NO_CIDADE']
                            if (k === 'rlEventoData') return `${x[k][0]['DT_INICIO']} - ${x[k][0]['HR_INICIO']}`

                            if (typeof x[k] === 'string') {
                                let item = csvUpper && !csvExcludeUpper.includes(k) ? (x[k] as string).toUpperCase() : x[k]

                                item = normalize ? item.normalize('NFD').replace(/[\u0300-\u036f]/g, '') : item

                                return removeQuotes ? `${item}` : `"${item}"`
                            } else if (typeof x[k] === 'object' && !Array.isArray(x[k]) && x[k] !== null) {
                                let strItemAsObject = transformArrayObjectInString(x[k]).slice(1, -1) // k: label (Ex.: jsNaturezaEvento)

                                let item = csvUpper && !csvExcludeUpper.includes(k) ? (strItemAsObject as string).toUpperCase() : strItemAsObject

                                item = normalize ? item.normalize('NFD').replace(/[\u0300-\u036f]/g, '') : item

                                return removeQuotes ? `${item}` : `"${item}"`
                            }

                            return x[k]
                        })
                        .join(',')
                })
                .join('\n')

            const csvData = header + values

            // download
            var link = window.document.createElement('a')
            link.setAttribute('href', 'data:text/csv;charset=utf-8,%EF%BB%BF' + encodeURI(csvData))
            link.setAttribute('download', `${csv?.fileName}.csv`)
            link.click()
        },
        [list]
    )

    useEffect(() => {
        filterBasedOnList(appliedFilters)
    }, [appliedFilters])

    const filterBasedOnList = (filteredList: any[]) => {
        let rawList: any[] = JSON.parse(JSON.stringify(Array.isArray(startData) ? startData : get(startData, dataPath) ?? '[]'))

        if (filteredList.length <= 0 || rawList.length <= 0) {
            setList(rawList)
            setPagCount(getCount(rawList))
            setCurrentPage(0)
            setListPage(1)
            return
        }

        let canContinue = true

        // verificando todas as chaves existem, se a chave não existir, não pode continuar e nao faz nada
        filteredList
            .map((x) => x.keyName)
            .forEach((x) => {
                if (!canContinue) return

                if (!Object.keys(rawList[0]).includes(x)) {
                    canContinue = false
                    return
                }
            })

        if (!canContinue) {
            setAppliedFilters([])
            localStorage.setItem(filterStorageName, JSON.stringify([]))
            setList(rawList)
            setPagCount(getCount(rawList))
            setCurrentPage(0)
            setListPage(1)
            return
        }

        function category(type: FilterTypes, keyName: string, uniqueName: string, customValue?: string, referencekey?: string) {
            if (type === 'a-z') {
                rawList = rawList.sort((a, b) => {
                    const aValue = a[keyName]
                    const bValue = b[keyName]
                    let valueA: number | string = aValue
                    let valueB: number | string = bValue

                    if (typeof aValue === 'string' || typeof bValue === 'string') {
                        valueA = String(aValue).toLowerCase()
                        valueB = String(bValue).toLowerCase()
                    }

                    console.table({
                        values: valueA + ' < ' + valueB,
                        result: valueA < valueB,
                    })

                    if (valueA < valueB) {
                        return -1
                    }

                    if (valueA > valueB) {
                        return 1
                    }

                    return 0
                })
            } //
            else if (type === 'z-a') {
                rawList = rawList.sort((a, b) => {
                    const aValue = a[keyName]
                    const bValue = b[keyName]
                    let valueA: number | string = aValue
                    let valueB: number | string = bValue

                    if (typeof aValue === 'string' || typeof bValue === 'string') {
                        valueA = String(aValue).toLowerCase()
                        valueB = String(bValue).toLowerCase()
                    }

                    if (valueA < valueB) {
                        return 1
                    }
                    if (valueA > valueB) {
                        return -1
                    }
                    return 0
                })
            } //
            else if (type === 'items' || type === 'select') {
                rawList = rawList
                    .filter((x) =>
                        String(x[keyName])
                            .toLowerCase()
                            .includes(customValue ?? '')
                    )
                    .sort((a, b) => {
                        const aValue = String(a[keyName])
                        const bValue = String(b[keyName])
                        const valueA = typeof aValue === 'number' ? aValue : aValue.toLowerCase()
                        const valueB = typeof bValue === 'number' ? bValue : bValue.toLowerCase()

                        if (valueA.includes(customValue ?? '')) return -1
                        if (valueB.includes(customValue ?? '')) return 1

                        if (valueA < valueB) {
                            return -1
                        }
                        if (valueA > valueB) {
                            return 1
                        }
                        return 0
                    })

                if (referencekey) {
                    const data: any[] = []

                    let newFiltered = rawList.filter((x) => {
                        const item = String(x[keyName])
                        const value = typeof item === 'number' ? item : item.toLowerCase()

                        if (value === customValue) {
                            data.push(x)
                            return false
                        }

                        return true
                    })

                    data.sort((a, b) => {
                        const aValue = String(a[referencekey])
                        const bValue = String(b[referencekey])
                        const valueA = typeof aValue === 'number' ? aValue : aValue.toLowerCase()
                        const valueB = typeof bValue === 'number' ? bValue : bValue.toLowerCase()

                        if (valueA < valueB) {
                            return 1
                        }

                        if (valueA > valueB) {
                            return -1
                        }
                        return 0
                    })

                    data.forEach((x) => {
                        newFiltered.unshift(x)
                    })

                    rawList = newFiltered
                }
            } //
            else if (type === 'data-a-z') {
                rawList = rawList.sort((a, b) => {
                    const aValue = a[keyName]
                    const bValue = b[keyName]

                    const separator = filterSeparator
                    const aDt = aValue.split(separator).map((k: string) => (k.match(/[0-9]+\/[0-9]+\/[0-9]+/) ?? [])[0])[0]
                    const bDt = bValue.split(separator).map((k: string) => (k.match(/[0-9]+\/[0-9]+\/[0-9]+/) ?? [])[0])[0]

                    if (!aDt && !bDt) return 0

                    const valueA = dayjs(aDt, 'D/M/YYYY')
                    const valueB = dayjs(bDt, 'D/M/YYYY')

                    if (valueA.isBefore(valueB)) {
                        return -1
                    }

                    if (valueA.isAfter(valueB)) {
                        return 1
                    }

                    return 0
                })
            } //
            else if (type === 'data-z-a') {
                rawList = rawList.sort((a, b) => {
                    const aValue = a[keyName],
                        bValue = b[keyName],
                        separator = filterSeparator,
                        aDt = aValue.split(separator).map((k: string) => (k.match(/[0-9]+\/[0-9]+\/[0-9]+/) ?? [])[0])[0],
                        bDt = bValue.split(separator).map((k: string) => (k.match(/[0-9]+\/[0-9]+\/[0-9]+/) ?? [])[0])[0]

                    if (!aDt && !bDt) return 0

                    const valueA = dayjs(aDt, 'D/M/YYYY')
                    const valueB = dayjs(bDt, 'D/M/YYYY')

                    if (valueA.isBefore(valueB)) {
                        return 1
                    }

                    if (valueA.isAfter(valueB)) {
                        return -1
                    }

                    return 0
                })
            }
        }

        function date(from: string, to: string, keyName: string) {
            const separator = filterSeparator

            rawList = rawList.filter((x: any) => {
                const dts: string[] = String(x[keyName])
                    .split(separator)
                    .map((k: string) => (k.match(/[0-9]+\/[0-9]+\/[0-9]+/) ?? [])[0] ?? '')
                let inside = false

                dts.forEach((k) => {
                    if (inside) return

                    const dt = dayjs(k, 'D/M/YYYY')
                    const dtFrom = dayjs(from, 'D/M/YYYY')

                    if (to) {
                        const dtTo = dayjs(to, 'D/M/YYYY')

                        if ((dtFrom.isBefore(dt) || dtFrom.isSame(dt)) && (dtTo.isAfter(dt) || dtTo.isSame(dt))) {
                            inside = true
                        }
                    } //
                    else {
                        if (dtFrom.isBefore(dt) || dtFrom.isSame(dt)) {
                            inside = true
                        }
                    }
                })

                return inside
            })

            rawList = rawList.sort((a, b) => {
                const aValue = a[keyName]
                const bValue = b[keyName]

                const separator = filterSeparator
                const aDt = aValue.split(separator).map((k: string) => (k.match(/[0-9]+\/[0-9]+\/[0-9]+/) ?? [])[0])[0]
                const bDt = bValue.split(separator).map((k: string) => (k.match(/[0-9]+\/[0-9]+\/[0-9]+/) ?? [])[0])[0]

                if (!aDt && !bDt) return 0

                const valueA = dayjs(aDt, 'D/M/YYYY')
                const valueB = dayjs(bDt, 'D/M/YYYY')

                if (valueA.isBefore(valueB)) {
                    return -1
                }

                if (valueA.isAfter(valueB)) {
                    return 1
                }

                return 0
            })
        }

        appliedFilters.forEach((x) => {
            if (!x.isDate) category(x.type, x.keyName, x.uniqueName, x.customValue, x.referencekey)
            else date(x.from, x.to, x.keyName)
        })

        setList(rawList)
        setPagCount(getCount(rawList))
        setCurrentPage(0)
        setListPage(1)
    }

    const handleFilterOption = (type: FilterTypes, keyName: string, uniqueName: string, customValue?: string, referencekey?: string) => {
        setAppliedFilters((s) => {
            const value = [
                ...s.filter((x) => (x.isDate ? true : x.keyName !== keyName)),
                {
                    type,
                    keyName,
                    uniqueName,
                    customValue,
                    referencekey,
                },
            ]

            localStorage.setItem(filterStorageName, JSON.stringify(value))

            return value
        })
    }

    const handleFilterReset = () => {
        const value = JSON.parse(JSON.stringify(Array.isArray(startData) ? startData : get(startData, dataPath)))
        setList(value)
        setAppliedFilters([])
        localStorage.setItem(filterStorageName, JSON.stringify([]))
    }

    const removeFilter = (uniqueName: string) => {
        if (uniqueName === 'isDate') setAppliedFilters((s) => s.filter((x) => !x.isDate))
        else
            setAppliedFilters((s) => {
                const value = s.filter((x) => x.uniqueName !== uniqueName)

                localStorage.setItem(filterStorageName, JSON.stringify(value))

                return value
            })
    }

    const handleDateFilter = (from: string, to: string, keyName: string) => {
        setAppliedFilters((s) => {
            const value = [
                ...s.filter((x) => !x.isDate),
                {
                    isDate: true,
                    from,
                    to,
                    keyName,
                    id: from + keyName,
                },
            ]

            localStorage.setItem(filterStorageName, JSON.stringify(value))

            return value
        })
    }

    function expandAll() {
        let obj: { [key: number]: boolean } = {}

        for (let i = 0; i < itemCount; i++) {
            obj[i] = !isExpandAll
        }

        setShowExpandObjOnExited(obj)
        setExpandObj(obj)

        isExpandAll = !isExpandAll
    }

    // effect usado quando for mostrar "VER MAIS" e "VER MENOS"
    useEffect(() => {
        const start = currentPage * itemsCount
        const newList = list.slice(start, start + itemsCount)
        let obj: { [key: number]: boolean } = {}

        newList.forEach((x, index) => {
            columns.forEach((c) => {
                obj[index] = obj[index] === true ? true : (get(x, c.keyName, '') ?? 'Não Informado').toString().length >= expandTextMaxLength
            })
        })

        setShowExpandObj(obj)
    }, [list, itemsCount, currentPage])

    if (error)
        return (
            <Box bgcolor='#E2E8F0' padding={2} marginX={2}>
                <Typography fontSize={24} textAlign='center' fontFamily='Inter'>
                    {error.status === 403 && 'Acesso negado'}
                    {error.status === 500 && (
                        <Box fontWeight={500} textAlign='center'>
                            Lamentavelmente, ocorreu um imprevisto em nosso servidor. Pedimos a sua compreensão e solicitamos que aguarde por um momento enquanto verificamos a situação.
                        </Box>
                    )}
                </Typography>
            </Box>
        )
    if (isLoading)
        return (
            <Stack sx={{ height: '100%', width: '100%' }} justifyContent='center' alignItems='center'>
                <Typography fontWeight={600} fontSize={20} paddingBottom={2} marginTop={14}>
                    Carregando {tableName}
                </Typography>
                <CircularProgress />
            </Stack>
        )

    if (!userLoaded && useKC) return <LinearProgress />

    return (
        <>
            <Box marginX={isSmall ? customMarginMobile : customMargin} bgcolor='white' p={2} borderRadius={6}>
                <Stack spacing={1.5} direction={{ xs: 'column', md: 'row' }}>
                    <Stack spacing={1.5} direction={{ xs: 'column', md: 'row' }} marginBottom={2} height={{ md: '40px', xs: 'inherit' }} width='100%'>
                        <TextField
                            InputProps={{
                                startAdornment: <SearchIcon sx={{ marginRight: 1, fill: '#c0c0c0' }} />,
                                sx: {
                                    '.MuiOutlinedInput-notchedOutline': { border: 'none' },
                                },
                            }}
                            sx={{
                                border: 'solid 1px #CBD5E1',
                                backgroundColor: '#F8FAFC',
                                borderRadius: '50px',
                                maxWidth: '600px',
                            }}
                            size='small'
                            onChange={onInputChange}
                            fullWidth
                            placeholder={`Pesquisar ${tableName}`}
                        />
                        {Object.keys(filters).length > 0 && (
                            <Button
                                startIcon={<FilterAlt />}
                                variant='contained'
                                onClick={(e) => setFilterOpen(true)}
                                sx={{
                                    borderRadius: '8px',
                                    paddingX: '24px',
                                    paddingY: '8px',
                                    minWidth: 200,
                                    backgroundColor: '#208FE8',
                                    textTransform: 'capitalize',
                                }}
                            >
                                <Stack direction='row' marginLeft={2} borderRadius={5} padding={0}>
                                    <span>Filtro</span>
                                    <span
                                        style={{
                                            whiteSpace: 'nowrap',
                                            marginLeft: 8,
                                            backgroundColor: '#15528f',
                                            borderRadius: 8,
                                            padding: '0px 8px',
                                        }}
                                    >
                                        {appliedFilters.length} aplicado{appliedFilters.length > 1 ? 's' : ''}
                                    </span>
                                </Stack>
                            </Button>
                        )}
                        <Button
                            variant='contained'
                            startIcon={isExpandAll ? <KeyboardArrowUp /> : <KeyboardArrowDown />}
                            sx={{
                                backgroundColor: '#637082',
                                ':hover': {
                                    backgroundColor: '#3c4757',
                                },
                                textTransform: 'capitalize',
                                borderRadius: '8px',
                                padding: '0px 8px',
                            }}
                            onClick={expandAll}
                        >
                            {isExpandAll ? 'Recolher Todos' : 'Expandir Todos'}
                        </Button>
                    </Stack>

                    <Stack alignItems='end' width={{ xs: '100%', md: '20%' }} pb={2} direction={{ xs: 'row', md: 'column' }} spacing={{ xs: 1, md: 0 }}>
                        <Typography fontWeight={600} textAlign='end'>
                            Demandas cadastradas
                        </Typography>
                        <Stack justifyContent='center'>
                            <Typography>
                                Exibindo {currentPage * itemsCount + 1}-{currentPage * itemsCount + 1 + getMaxItems().length - 1} de {list.length}
                            </Typography>
                        </Stack>
                    </Stack>
                </Stack>
                <Stack spacing={0.2}>
                    {getMaxItems().length <= 0 ? (
                        <Stack sx={{ backgroundColor: '#E2E8F0', padding: 2, marginX: { xs: 2, md: 0 } }} justifyContent='center' alignItems='center'>
                            <Typography fontSize={21} fontFamily='Inter' fontWeight={600} textAlign='center'>
                                {user ? emptyMsg.user : emptyMsg.public}
                            </Typography>
                        </Stack>
                    ) : (
                        getMaxItems().map((x: any, index: number) => (
                            <Paper
                                key={index}
                                sx={{
                                    padding: 0.5,
                                    backgroundColor: index % 2 === 0 ? '#F8FAFC' : 'white',
                                    paddingTop: 2,
                                    borderTop: 'solid 1.5px #E2E8F0',
                                    position: 'relative',
                                }}
                                elevation={0}
                            >
                                <Grid container spacing={isSmall ? 2 : 0} paddingX={2} rowSpacing={2}>
                                    {columns.map((c) => (
                                        <Grid
                                            key={c.keyName + index}
                                            item
                                            xs={12}
                                            md={lg ? (12 / columnSize) * (!!c.size ? c.size : 1) : mediaQueryLG ? mediaQueryLG.all : (12 / columnSize) * (!!c.size ? c.size : 1)}
                                            sx={{
                                                overflow: 'hidden',
                                            }}
                                        >
                                            <Box sx={{ width: 'max-content', paddingX: 1 }}>
                                                <Typography fontSize={16} fontWeight={700} color='#1E293B' fontFamily='Inter'>
                                                    {c.title}
                                                </Typography>
                                            </Box>
                                            <Box paddingLeft={1} position='relative'>
                                                <Collapse in={expandObj[index] === true} collapsedSize={collapsedSize} onExited={(e) => setShowExpandObjOnExited((s) => ({ ...s, [index]: false }))}>
                                                    <Box
                                                        sx={{
                                                            wordWrap: 'break-word',
                                                            color: '#1E293B',
                                                            fontSize: 16,
                                                        }}
                                                        fontFamily='Inter'
                                                    >
                                                        <Box>
                                                            {c.customComponent ? (
                                                                c.customComponent(get(x, c.keyName), x)
                                                            ) : (
                                                                <Box color='transparent' sx={{ pointerEvents: 'none', userSelect: 'none' }}>
                                                                    {get(x, c.keyName, '')}
                                                                </Box>
                                                            )}
                                                        </Box>
                                                        <Box position='absolute' top={0}>
                                                            {c.customComponent ? (
                                                                c.customComponent(get(x, c.keyName), x)
                                                            ) : (
                                                                <>
                                                                    {showExpandObjOnExited[index] ? (
                                                                        get(x, c.keyName, '')
                                                                    ) : (get(x, c.keyName, '') ?? '').toString().length >= expandTextMaxLength ? (
                                                                        <>{(get(x, c.keyName, '') ?? '').toString().substring(0, expandTextMaxLength) + '...'}</>
                                                                    ) : (
                                                                        get(x, c.keyName, '')
                                                                    )}
                                                                </>
                                                            )}
                                                        </Box>
                                                    </Box>
                                                </Collapse>
                                            </Box>
                                        </Grid>
                                    ))}
                                    <Grid item xs={12} md={lg ? 12 / columnSize : mediaQueryLG ? mediaQueryLG.action : 12 / columnSize}>
                                        <Stack direction='row' alignItems='center' justifyContent={isSmall ? 'start' : 'flex-end'} sx={{ height: '100%', paddingBottom: isSmall ? 2 : 0 }}>
                                            {action(x)}
                                        </Stack>
                                    </Grid>
                                    {showExpandObj[index] && (
                                        <Stack direction='row' justifyContent='flex-end' bottom={0} width='100%'>
                                            <Button
                                                onClick={(e) => {
                                                    setExpandObj((s) => ({ ...s, [index]: !s[index] }))
                                                    setShowExpandObjOnExited((s) => ({ ...s, [index]: true }))
                                                }}
                                                sx={{
                                                    padding: 0,
                                                    color: '#637082',
                                                    textTransform: 'capitalize',
                                                }}
                                                startIcon={expandObj[index] ? <ExpandLess /> : <ExpandMore />}
                                            >
                                                {expandObj[index] ? 'Ver Menos' : 'Ver Mais'}
                                            </Button>
                                        </Stack>
                                    )}
                                </Grid>
                            </Paper>
                        ))
                    )}
                </Stack>

                {getMaxItems().length > 0 && (
                    <Stack
                        padding={1}
                        direction={{
                            xs: 'column',
                            md: 'row',
                        }}
                        spacing={{
                            xs: 2,
                            md: 0,
                        }}
                        justifyContent='space-between'
                        alignItems='center'
                    >
                        {csv && (
                            <Stack
                                direction={{
                                    xs: 'column',
                                    md: 'row',
                                }}
                                justifyContent='flex-end'
                                spacing={1}
                            >
                                {csvWithoutZip && (
                                    <Button
                                        startIcon={<FileDownloadIcon />}
                                        variant='contained'
                                        size='small'
                                        onClick={downloadCSV}
                                        sx={{ backgroundColor: '#5a88b0', marginRight: { xs: 2, md: 0 }, width: { xs: '100%', md: 'fit-content' } }}
                                    >
                                        {csvNoZipText}
                                    </Button>
                                )}
                                {csvShowAllButton && (
                                    <Button
                                        startIcon={<FileDownloadIcon />}
                                        variant='contained'
                                        size='small'
                                        onClick={downloadCSVAll}
                                        sx={{ backgroundColor: '#64748B', marginRight: { xs: 2, md: 0 }, width: { xs: '100%', md: 'fit-content' } }}
                                    >
                                        {csvAllButtonTitle}
                                    </Button>
                                )}
                                <Button
                                    startIcon={<FileDownloadIcon />}
                                    variant='contained'
                                    size='small'
                                    onClick={(e) => downloadCSV(e, true)}
                                    sx={{ backgroundColor: '#22C55E', marginRight: { xs: 2, md: 0 }, width: { xs: '100%', md: 'fit-content' } }}
                                >
                                    {csvButtonTitle}
                                </Button>
                            </Stack>
                        )}
                    </Stack>
                )}
            </Box>

            <Stack direction='row' justifyContent='center' paddingY={1} paddingTop={2}>
                <Stack direction='row' justifyContent='center' alignItems='center' spacing={2}>
                    <Button
                        onClick={(e) =>
                            setListPage((s) => {
                                if (s > 1) {
                                    return s - 1
                                }

                                return 1
                            })
                        }
                        sx={{ bgcolor: 'white', borderRadius: '50px', height: '40px', width: '40px', minWidth: 0, border: 'solid 1px #E2E8F0' }}
                    >
                        <NavigateNextRoundedIcon sx={{ transform: 'scale(1.5) scaleX(-1)' }} />
                    </Button>
                    <Pagination
                        renderItem={(item) => {
                            if (item.type === 'page')
                                return (
                                    <Button
                                        onClick={item.onClick}
                                        sx={{
                                            fontWeight: 600,
                                            ...(item.selected
                                                ? {
                                                      bgcolor: '#33B55D',
                                                      color: 'white',
                                                  }
                                                : {
                                                      color: '#1E293B',
                                                  }),
                                            borderRadius: '100%',
                                            padding: 0,
                                            margin: 0,
                                            minWidth: 0,
                                            width: '40px',
                                            height: '40px',

                                            marginX: 0.25,
                                        }}
                                    >
                                        {item.page}
                                    </Button>
                                )

                            if (!['next', 'previous', 'page'].includes(item.type)) return <PaginationItem {...item} />
                        }}
                        count={paginationCount}
                        siblingCount={isSmall ? 0 : 6}
                        size='large'
                        onChange={onPaginationChange}
                        page={listPage}
                        shape='circular'
                        variant='outlined'
                        sx={{
                            '.MuiPagination-ul': {
                                backgroundColor: 'white',
                                border: 'solid 1px #E2E8F0',
                                borderRadius: '50px',
                                paddingX: 0.25,
                                paddingY: 0.5,
                            },
                        }}
                    />
                    <Button
                        onClick={(e) =>
                            setListPage((s) => {
                                if (s < paginationCount) {
                                    return s + 1
                                }

                                return paginationCount
                            })
                        }
                        sx={{ bgcolor: 'white', borderRadius: '50px', height: '40px', width: '40px', minWidth: 0, border: 'solid 1px #E2E8F0' }}
                    >
                        <NavigateNextRoundedIcon sx={{ transform: 'scale(1.5)' }} />
                    </Button>
                </Stack>
            </Stack>

            <SwipeableDrawer anchor={isSmall ? 'bottom' : 'right'} open={filterOpen} onClose={(e) => setFilterOpen(false)} onOpen={(e) => setFilterOpen(true)}>
                <List sx={{ minWidth: 310 }}>
                    {Object.keys(filters).map((f, fIndex) => (
                        <React.Fragment key={JSON.stringify({ f, fIndex })}>
                            <ListItemButton
                                onClick={(e) =>
                                    setFilterCollapse((s) =>
                                        s.map((x, idx) => {
                                            if (idx === fIndex) return !x

                                            return x
                                        })
                                    )
                                }
                                sx={{
                                    backgroundColor: '#ebeef2',
                                }}
                            >
                                <ListItemIcon>
                                    <Circle transform='scale(0.4)' />
                                </ListItemIcon>
                                <ListItemText primary={f} />
                                {filterCollapse[fIndex] ? <ExpandLess /> : <ExpandMore />}
                            </ListItemButton>

                            <Collapse in={filterCollapse[fIndex]} timeout='auto' unmountOnExit>
                                <List component='div' disablePadding sx={{ backgroundColor: 'white' }}>
                                    {filters[f].map((x, index) => (
                                        <React.Fragment key={JSON.stringify({ f, index })}>
                                            {x.options ? (
                                                x.options.map((o) => (
                                                    <ListItemButton
                                                        sx={{
                                                            pl: 4,
                                                            borderBottom: 1,
                                                            borderColor: '#ebeef2',
                                                            ...(appliedFilters.map((x) => x.uniqueName).includes(`${f}:${JSON.stringify(o)}`) && {
                                                                bgcolor: '#b7e4c7',
                                                                ':hover': { bgcolor: '#b7e4c7' },
                                                            }),
                                                        }}
                                                    >
                                                        <ListItemText
                                                            primary={o.name}
                                                            onClick={(e) => handleFilterOption(x.type, x.keyName, `${f}:${JSON.stringify(o)}`, o.key, x.referenceKey)}
                                                            sx={{ color: o.color, fontWeight: 600 }}
                                                        />
                                                        <Box>
                                                            {appliedFilters.map((x) => x.uniqueName).includes(`${f}:${JSON.stringify(o)}`) && (
                                                                <Tooltip title='Remover'>
                                                                    <IconButton
                                                                        sx={{ bgcolor: '#c71c1c', height: '30px', width: '30px', ':hover': { bgcolor: 'red', border: '2px solid #9e2929' } }}
                                                                        onClick={(e) => removeFilter(`${f}:${JSON.stringify(o)}`)}
                                                                    >
                                                                        <Delete sx={{ fill: 'white', transform: 'scale(0.8, 0.8)' }} />
                                                                    </IconButton>
                                                                </Tooltip>
                                                            )}
                                                        </Box>
                                                    </ListItemButton>
                                                ))
                                            ) : x.type === 'date-interval' ? (
                                                <Box padding={2}>
                                                    <FormProvider onSubmit={(d) => handleDateFilter(d['filterDtStart'], d['filterDtEnd'], x.keyName)}>
                                                        <DatePicker name='filterDtStart' title='A partir de:' required />
                                                        <Box marginTop={2} />
                                                        <DatePicker name='filterDtEnd' title='Até (opcional):' />

                                                        <Stack marginTop={2}>
                                                            <Button type='submit' variant='outlined' startIcon={<CalendarToday />} sx={{ width: '100%' }}>
                                                                Filtrar por Data
                                                            </Button>
                                                            <Box>
                                                                {appliedFilters.filter((x) => x.isDate).length > 0 && (
                                                                    <Button
                                                                        startIcon={<Delete sx={{ fill: 'white' }} />}
                                                                        variant='contained'
                                                                        color='error'
                                                                        sx={{ width: '100%', marginTop: 1 }}
                                                                        onClick={(e) => removeFilter('isDate')}
                                                                    >
                                                                        Remover Filtro Data
                                                                    </Button>
                                                                )}
                                                            </Box>
                                                        </Stack>
                                                    </FormProvider>
                                                </Box>
                                            ) : x.selectList ? (
                                                <>
                                                    <Autocomplete
                                                        options={x.selectList.map((x) => ({
                                                            id: x.toLowerCase(),
                                                            label: x,
                                                        }))}
                                                        onFocus={(e) => console.log('ata')}
                                                        onChange={(e, value) => {
                                                            if (value) {
                                                                const id = `${f}:${JSON.stringify(value)}`
                                                                handleFilterOption(x.type, x.keyName, id, value?.label.toLowerCase(), x.referenceKey)
                                                                setOldSelectState(id)
                                                            } else {
                                                                removeFilter(oldSelectState)
                                                            }
                                                        }}
                                                        sx={{
                                                            margin: 1,
                                                        }}
                                                        size='small'
                                                        renderInput={(params) => <TextField {...params} label='Teste' />}
                                                    />
                                                </>
                                            ) : x.listEndpoint ? (
                                                <>
                                                    <FetchSelectAutoComplete
                                                        url={x.listEndpoint}
                                                        label={x.name}
                                                        onChange={(e: any, value: any) => {
                                                            if (value) {
                                                                const id = `${f}:${JSON.stringify(value)}`
                                                                handleFilterOption(x.type, x.keyName, id, value?.id.toLowerCase(), x.referenceKey)
                                                                setOldSelectState(id)
                                                            } else {
                                                                removeFilter(oldSelectState)
                                                            }
                                                        }}
                                                    />
                                                </>
                                            ) : (
                                                <Stack
                                                    direction={'row'}
                                                    sx={{
                                                        ...(appliedFilters.map((x) => x.uniqueName).includes(`${f}:${JSON.stringify(x)}`) && {
                                                            bgcolor: '#b7e4c7',
                                                            ':hover': { bgcolor: '#b7e4c7' },
                                                        }),
                                                    }}
                                                >
                                                    <ListItemButton
                                                        sx={{
                                                            pl: 4,
                                                            borderBottom: 1,
                                                            borderColor: '#ebeef2',
                                                        }}
                                                        onClick={(e) => handleFilterOption(x.type, x.keyName, `${f}:${JSON.stringify(x)}`)}
                                                    >
                                                        <ListItemIcon sx={{ minWidth: '25px' }}>
                                                            {x.type === 'a-z' || x.type === 'data-a-z' ? (
                                                                <South transform='scale(0.5)' />
                                                            ) : x.type === 'z-a' || x.type === 'data-z-a' ? (
                                                                <North transform='scale(0.5)' />
                                                            ) : null}
                                                        </ListItemIcon>
                                                        <ListItemText primary={x.name} />
                                                    </ListItemButton>
                                                    <Stack justifyContent='center' marginX={2}>
                                                        {appliedFilters.map((x) => x.uniqueName).includes(`${f}:${JSON.stringify(x)}`) && (
                                                            <Tooltip title='Remover'>
                                                                <IconButton
                                                                    sx={{ bgcolor: '#c71c1c', height: '30px', width: '30px', ':hover': { bgcolor: 'red', border: '2px solid #9e2929' } }}
                                                                    onClick={(e) => removeFilter(`${f}:${JSON.stringify(x)}`)}
                                                                >
                                                                    <Delete sx={{ fill: 'white', transform: 'scale(0.8, 0.8)' }} />
                                                                </IconButton>
                                                            </Tooltip>
                                                        )}
                                                    </Stack>
                                                </Stack>
                                            )}
                                        </React.Fragment>
                                    ))}
                                </List>
                            </Collapse>
                        </React.Fragment>
                    ))}
                </List>
                <Button variant='contained' onClick={handleFilterReset} startIcon={<RestartAlt />} sx={{ marginX: 2, marginBottom: 2 }}>
                    Reiniciar
                </Button>
                {/* <Box>
                    <Typography>Filtros aplicados:</Typography>
                    <Stack>
                        {appliedFilters.map((x) => (
                            <Box>{JSON.stringify(x)}</Box>
                        ))}
                    </Stack>
                </Box> */}
            </SwipeableDrawer>
        </>
    )
}

function FetchSelectAutoComplete(props: { url: string; onChange: any; label: string }) {
    const [data, setData] = useState([])

    useEffect(() => {
        axios
            .get(props.url)
            .then((dt) => {
                setData(dt.data)
            })
            .catch((e) => console.log('Erro ao buscar dados do filtro'))
    }, [])

    return (
        <>
            <Autocomplete
                options={data}
                onChange={props.onChange}
                sx={{
                    margin: 1,
                }}
                size='small'
                renderInput={(params) => <TextField {...params} label={props.label} />}
            />
        </>
    )
}

export default React.memo(Table)
