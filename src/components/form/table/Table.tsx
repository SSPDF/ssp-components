import { ExpandLess, ExpandMore, FilterAlt, KeyboardArrowDown, KeyboardArrowUp, Refresh } from '@mui/icons-material'
import Clear from '@mui/icons-material/Clear'
import FileDownloadIcon from '@mui/icons-material/FileDownload'
import NavigateNextRoundedIcon from '@mui/icons-material/NavigateNextRounded'
import { default as Search, default as SearchIcon } from '@mui/icons-material/Search'
import {
    Alert,
    Autocomplete,
    Box,
    Button,
    CircularProgress,
    Collapse,
    FormControl,
    IconButton,
    LinearProgress,
    Menu,
    MenuItem,
    PaginationItem,
    Paper,
    Select,
    Stack,
    useMediaQuery,
    useTheme,
} from '@mui/material'
import Grid from '@mui/material/Grid'
import Pagination from '@mui/material/Pagination'
import TextField from '@mui/material/TextField'
import Typography from '@mui/material/Typography'
import { DatePicker, LocalizationProvider } from '@mui/x-date-pickers'
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs'
import dayjs from 'dayjs'
import JSZip from 'jszip'
import get from 'lodash.get'
import React, { ChangeEvent, useCallback, useContext, useEffect, useRef, useState } from 'react'
import { AuthContext } from '../../../context/auth'
import { MODAL } from '../../modal/Modal'
import CustomMenu from '../../utils//CustomMenu'

function removePunctuationAndAccents(text: string) {
    // Remove accents and diacritics
    const normalizedText = text.normalize('NFD').replace(/[\u0300-\u036f]/g, '')

    // Remove punctuation marks
    const cleanedText = normalizedText.replace(/[!"#$%&'()*+,\-./:;<=>?@[\\\]^_`{|}~]/g, '')

    return cleanedText
}

function formatarString(str: string) {
    return str
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .toLowerCase()
        .trim()
}

interface ColumnData {
    title: string
    keyName: string
    customComponent?: (content: string, obj: any) => JSX.Element
    size?: number
}

interface OrderBy {
    label: string
    key: string
    type: 'string' | 'number'
}

let startData: any[] = []
let isExpandAll: boolean = false
let localTableName = ''
let orderAsc = false
let filtersFuncData: { [key: string]: (value: string) => any } = {}
let localTableNameCache = ''

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
    // filters = {},
    // filterSeparator = '|',
    hideTitleCSV = false,
    csvExcludeUpper = [],
    multipleDataPath = '',
    expandTextMaxLength = 50,
    collapsedSize = 53,
    customMargin = 4,
    customMarginMobile = 0,
    filtersFunc,
    filters = [],
    orderBy = [],
    id,
}: {
    id: string
    mediaQueryLG?: {
        all: number
        action: number
    }
    filtersFunc?: { [key: string]: (value: string) => any }
    filters?: FilterValue[]
    orderBy?: OrderBy[]
    customMargin?: number
    customMarginMobile?: number
    normalize?: boolean
    csvUpper?: boolean
    multipleDataPath?: string
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
    // filters?: {
    //     [key: string]: {
    //         type: FilterTypes
    //         keyName: string
    //         name: string
    //         listEndpoint?: string
    //         selectList?: string[]
    //         referenceKey?: string
    //         options?: { name: string; color: string; key: string }[]
    //     }[]
    // }
    // filterSeparator?: string
}) {
    const [isLoading, setIsLoading] = useState(true)
    const [error, setError] = useState<null | { status: number }>(null)
    const [data, setData] = useState<any>(null)

    const { user, userLoaded } = useContext(AuthContext)
    const [list, setList] = useState<any[]>([])
    const [listClone, setListClone] = useState<any[]>([])
    //numero de items pra ser mostrado
    const [itemsCount, setItemsCount] = useState(itemCount)
    const [currentPage, setCurrentPage] = useState(0)
    const [paginationCount, setPagCount] = useState(1)
    const [listPage, setListPage] = useState(1)
    const [oldSelectState, setOldSelectState] = useState<string>('')
    const [expandObj, setExpandObj] = useState<{ [key: number]: boolean }>({})
    const [showExpandObj, setShowExpandObj] = useState<{ [key: number]: boolean }>({})
    const [showExpandObjOnExited, setShowExpandObjOnExited] = useState<{ [key: number]: boolean }>({})
    const [filterKey, setFilterKey] = useState('filterKey')
    const theme = useTheme()
    const isSmall = useMediaQuery(theme.breakpoints.only('xs'))
    const filterContainer = useRef(null)

    const lg = useMediaQuery(theme.breakpoints.up(2000))

    localTableName = `tableFilter_${id}`
    localTableNameCache = `tableFilterCache_${id}`
    filtersFuncData = filtersFunc ?? {}

    if (!localStorage.getItem(localTableNameCache)) localStorage.setItem(localTableNameCache, JSON.stringify(filters))

    if (localStorage.getItem(localTableNameCache) !== JSON.stringify(filters)) {
        localStorage.setItem(localTableNameCache, JSON.stringify(filters))
        localStorage.removeItem(localTableName)
    }

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

        const value = getData(data)

        setList(value)
        setListClone(value)
        setPagCount(getCount(value))

        if (localStorage.getItem(localTableName)) {
            filtrar(JSON.parse(localStorage.getItem(localTableName) as string) as FilterValue[])
        }
    }, [itemsCount, isLoading, data, getCount, error])

    useEffect(() => {
        setCurrentPage(listPage - 1)
    }, [listPage])

    const onPaginationChange = useCallback((e: ChangeEvent<unknown>, page: number) => {
        setListPage(page)
    }, [])

    function onInputChange(e: ChangeEvent) {
        console.log(listClone)
        const searchValue = (e.target as HTMLInputElement).value

        if (searchValue === '') {
            setList(listClone)
            setPagCount(getCount(getData(list)))
            return
        }

        const listData: object[] = getData(list)

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
    }

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

    function expandAll() {
        let obj: { [key: number]: boolean } = {}

        for (let i = 0; i < itemCount; i++) {
            obj[i] = !isExpandAll
        }

        setShowExpandObjOnExited(obj)
        setExpandObj(obj)

        isExpandAll = !isExpandAll
    }

    function reset() {
        setList(startData)
        setListClone(startData)
        setPagCount(getCount(startData))
        setCurrentPage(0)
        setListPage(1)
        localStorage.removeItem(localTableName)
        setFilterKey(new Date().getTime().toString())
    }

    function filtrar(filterData: FilterValue[]) {
        if (!startData) return

        let currentData: any[] = JSON.parse(JSON.stringify(startData))

        filterData
            .filter((dt) => dt.value)
            .forEach((dt) => {
                let filteredData: any[] = []

                console.log(dt)

                switch (dt.type) {
                    case 'number':
                        switch (dt.operator) {
                            case 'igual':
                                currentData.forEach((cd) => {
                                    const value = Number(get(cd, dt.keyName, ''))
                                    if (value === Number(dt.value)) {
                                        filteredData.push(cd)
                                    }
                                })
                                break
                            case 'maior que':
                                currentData.forEach((cd) => {
                                    const value = Number(get(cd, dt.keyName, ''))

                                    if (value > Number(dt.value)) {
                                        filteredData.push(cd)
                                    }
                                })
                                break
                            case 'menor que':
                                currentData.forEach((cd) => {
                                    const value = Number(get(cd, dt.keyName, ''))

                                    if (value < Number(dt.value)) {
                                        filteredData.push(cd)
                                    }
                                })
                                break
                        }
                        break
                    case 'string':
                        console.log('ata: ', dt.operator)
                        switch (dt.operator) {
                            case 'igual':
                                currentData.forEach((cd) => {
                                    const value = get(cd, dt.keyName, '')

                                    if (formatarString(value) === formatarString(dt.value)) {
                                        filteredData.push(cd)
                                    }
                                })
                                break
                            case 'contem':
                                currentData.forEach((cd) => {
                                    const value: string = get(cd, dt.keyName, '')

                                    if (!value) return

                                    if (dt.useList) {
                                        if (formatarString(value).includes(formatarString(dt.value.id))) {
                                            filteredData.push(cd)
                                        }
                                    } else {
                                        if (formatarString(value).includes(formatarString(dt.value as string))) {
                                            filteredData.push(cd)
                                        }
                                    }
                                })
                                break
                            case 'tem um dos':
                                currentData.forEach((cd) => {
                                    const value: string = get(cd, dt.keyName, '')

                                    if (!value) return

                                    if ((dt.value as { id: any; label: string }[]).map((x) => formatarString(x.id)).includes(formatarString(value))) {
                                        filteredData.push(cd)
                                    }
                                })
                                break
                        }
                        break
                    case 'date':
                        switch (dt.operator) {
                            case 'data exata':
                                currentData.forEach((cd) => {
                                    const value = dayjs(get(cd, dt.keyName, ''), 'DD/MM/YYYY')

                                    if (!value.isValid()) return

                                    if (value.isSame(dayjs(dt.value as string, 'DD/MM/YYYY'))) {
                                        filteredData.push(cd)
                                    }
                                })
                                break
                            case 'entre':
                                currentData.forEach((cd) => {
                                    const value = dayjs(get(cd, dt.keyName, ''), 'DD/MM/YYYY')
                                    const dateA = dayjs(dt.value as string, 'DD/MM/YYYY')
                                    const dateB = dayjs(dt.value2 as string, 'DD/MM/YYYY')

                                    if (!dateA.isValid() || !dateB.isValid()) return

                                    if ((value.isAfter(dateA) || value.isSame(dateA)) && (value.isBefore(dateB) || value.isSame(dateB))) {
                                        filteredData.push(cd)
                                    }
                                })
                                break
                        }
                        break
                    case 'dates':
                        switch (dt.operator) {
                            case 'data inicio':
                                currentData.forEach((cd) => {
                                    const dates: string[] = filtersFuncData[dt.customFunc!](get(cd, dt.keyName, '')) ?? []

                                    if (dates.length <= 0) return

                                    var inicioDate = dates[0]
                                    var inicioValue = dayjs(inicioDate, 'DD/MM/YYYY')

                                    if (inicioValue.isSame(dayjs(dt.value as string, 'DD/MM/YYYY'))) {
                                        filteredData.push(cd)
                                    }
                                })
                                break
                            case 'data fim':
                                currentData.forEach((cd) => {
                                    const dates: string[] = filtersFuncData[dt.customFunc!](get(cd, dt.keyName, '')) ?? []

                                    if (dates.length <= 0) return

                                    var fimDate = dates[dates.length - 1]
                                    var fimValue = dayjs(fimDate, 'DD/MM/YYYY')

                                    if (fimValue.isSame(dayjs(dt.value as string, 'DD/MM/YYYY'))) {
                                        filteredData.push(cd)
                                    }
                                })
                                break
                            case 'tem a data':
                                currentData.forEach((cd) => {
                                    const dates: string[] = filtersFuncData[dt.customFunc!](get(cd, dt.keyName, '')) ?? []

                                    if (dates.includes(dt.value)) {
                                        filteredData.push(cd)
                                    }
                                })
                                break
                        }
                        break
                }

                currentData = filteredData
            })

        setList(currentData)
        setPagCount(getCount(currentData))
        setCurrentPage(0)
        setListPage(1)
        localStorage.setItem(localTableName, JSON.stringify(filterData))
        setListClone(currentData)
    }

    function ordenar(order: OrderBy) {
        let oldList = [...list]

        oldList.sort((a, b) => {
            const aValue = order.type === 'string' ? get(a, order.key, '') : Number(get(a, order.key, 0))
            const bValue = order.type === 'string' ? get(b, order.key, '') : Number(get(b, order.key, 0))

            if (orderAsc) {
                if (aValue < bValue) return -1
                if (aValue > bValue) return 1
            } else {
                if (aValue > bValue) return -1
                if (aValue < bValue) return 1
            }

            return 0
        })

        orderAsc = !orderAsc

        setList(oldList)
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

    useEffect(() => {
        console.log(filterContainer.current)
    }, [filterContainer.current])

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
                    <Stack spacing={1.5} direction={{ xs: 'column', md: 'row' }} height={{ md: '40px', xs: 'inherit' }} width='100%'>
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

                        <Button
                            startIcon={<FilterAlt />}
                            variant='contained'
                            onClick={(e) =>
                                MODAL.open(
                                    <CriarFiltro
                                        key={filterKey}
                                        reset={reset}
                                        filtrar={filtrar}
                                        baseFilters={[...filters]}
                                        filters={localStorage.getItem(localTableName) ? (JSON.parse(localStorage.getItem(localTableName)!) as FilterValue[]) : [...filters]}
                                    />
                                )
                            }
                            sx={{
                                borderRadius: 3,
                                paddingX: '24px',
                                paddingY: '8px',
                                backgroundColor: '#208FE8',
                                textTransform: 'capitalize',
                            }}
                        >
                            <Stack direction='row' borderRadius={5} padding={0}>
                                <span>Filtrar</span>
                            </Stack>
                        </Button>

                        <Stack direction='row' spacing={1}>
                            <CustomMenu
                                data={orderBy.map((x) => ({
                                    name: x.label,
                                    onClick: () => ordenar(x),
                                }))}
                                btProps={{
                                    startIcon: <KeyboardArrowDown />,
                                    fullWidth: true,
                                }}
                            >
                                Ordenar
                            </CustomMenu>

                            <Button
                                variant='contained'
                                fullWidth
                                startIcon={isExpandAll ? <KeyboardArrowUp /> : <KeyboardArrowDown />}
                                sx={{
                                    backgroundColor: '#637082',
                                    ':hover': {
                                        backgroundColor: '#3c4757',
                                    },
                                    textTransform: 'capitalize',
                                    borderRadius: 3,
                                    padding: {
                                        md: '0px 8px',
                                    },
                                }}
                                onClick={expandAll}
                            >
                                {isExpandAll ? 'Recolher' : 'Expandir'}
                            </Button>
                        </Stack>
                    </Stack>

                    <Stack alignItems='end' width={{ xs: '100%', md: '20%' }} direction={{ xs: 'row', md: 'column' }} spacing={{ xs: 1, md: 0 }}>
                        <Typography fontWeight={600} textAlign='end'>
                            Registro de {tableName}s
                        </Typography>
                        <Stack justifyContent='center'>
                            <Typography>
                                Exibindo {currentPage * itemsCount + 1}-{currentPage * itemsCount + 1 + getMaxItems().length - 1} de {list.length}
                            </Typography>
                        </Stack>
                    </Stack>
                </Stack>

                {localStorage.getItem(localTableName) && (
                    <Box display='inline-flex' flexWrap='wrap' padding={0.5} borderRadius={4} marginBottom={1}>
                        {(JSON.parse(localStorage.getItem(localTableName) ?? '[]') as FilterValue[])
                            .filter((x) => x.value)
                            .map((x) => (
                                <Stack direction='row' spacing={1} bgcolor='#4e85c1' color='white' width='fit-content' paddingY={0.5} borderRadius={2} paddingX={1} m={0.5}>
                                    <Typography fontWeight={700}>{x.label}</Typography>
                                    <Typography fontStyle='italic'>{x.operator}</Typography>
                                    <Typography bgcolor='white' borderRadius={2} paddingX={1} color='black'>
                                        {Array.isArray(x.value)
                                            ? (x.value as { id: string; label: string }[]).map((x) => x.label).join(' - ')
                                            : typeof x.value === 'object'
                                            ? (x.value as { id: string; label: string }).label
                                            : x.value.toString()}
                                    </Typography>
                                    <IconButton
                                        onClick={(e) => {
                                            let currentValue = JSON.parse(localStorage.getItem(localTableName) ?? '[]') as FilterValue[]

                                            currentValue = currentValue.map((item) => {
                                                if (item.label === x.label) {
                                                    return { ...item, value: '', ...(item.value2 ? { value2: '' } : {}) }
                                                }

                                                return item
                                            })

                                            filtrar(currentValue)
                                        }}
                                        size='small'
                                        sx={{
                                            padding: 0,
                                        }}
                                    >
                                        <Clear
                                            sx={{
                                                fill: 'white',
                                            }}
                                        />
                                    </IconButton>
                                </Stack>
                            ))}
                    </Box>
                )}
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
        </>
    )
}

/* -------------------------------------------------------------------------- */
/*                                   FILTRO                                   */
/* -------------------------------------------------------------------------- */

type FilterType = 'string' | 'number' | 'date' | 'dates'
type FilterOperators =
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

interface FilterValue {
    label: string
    keyName: string
    type: FilterType
    operator: FilterOperators
    operators: FilterOperators[]
    value: string | any
    value2?: string | any
    useList?: { id: string; label: string }[]
    customFunc?: string
}

function CriarFiltro({ filters, baseFilters, filtrar, reset }: { reset: () => void; filtrar: (dt: FilterValue[]) => void; filters: FilterValue[]; baseFilters: FilterValue[] }) {
    const [data, setData] = useState<FilterValue[]>(filters)
    const [resetFields, setResetFields] = useState(false)

    function addRule(filter: FilterValue) {
        setData((dt) => {
            return [...dt, filter]
        })
    }

    const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null)
    const open = Boolean(anchorEl)
    const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
        setAnchorEl(event.currentTarget)
    }
    const handleClose = () => {
        setAnchorEl(null)
    }

    return (
        <Box
            width={{
                xs: 'inherit',
                md: 850,
            }}
        >
            <Menu open={open} onClose={handleClose} anchorEl={anchorEl}>
                {baseFilters.map((x) => (
                    <MenuItem
                        onClick={(e) => {
                            addRule(x)
                            setAnchorEl(null)
                        }}
                    >
                        {x.label}
                    </MenuItem>
                ))}
            </Menu>

            <Stack direction='row' justifyContent='space-between'>
                {/* <Button
                    variant='contained'
                    onClick={handleClick}
                    sx={{
                        marginBottom: 2,
                        textTransform: 'capitalize',
                    }}
                    endIcon={<ExpandMore />}
                >
                    Adicionar Regra
                </Button> */}
                <Typography fontWeight={700} fontSize={18}>
                    Filtrar
                </Typography>
                <Button
                    startIcon={<Refresh />}
                    sx={{
                        textTransform: 'capitalize',
                    }}
                    onClick={(e) => {
                        reset()
                        MODAL.close()
                    }}
                >
                    Limpar
                </Button>
            </Stack>

            <Box marginBottom={1}>
                <Alert severity='warning'>Preencha apenas os campos que deseja filtrar.</Alert>
            </Box>

            <Stack>
                {resetFields ? (
                    data.map((d, idx) => (
                        <FilterRow
                            filterValue={d}
                            setReset={setResetFields}
                            idx={idx}
                            setDt={(valueData) => {
                                setData((dt) => {
                                    let arr = [...dt]
                                    arr[idx] = valueData
                                    return arr
                                })
                            }}
                            removeDt={() => {
                                setData((dt) => {
                                    let arr = [...dt]
                                    arr.splice(idx, 1)
                                    return arr
                                })
                            }}
                        />
                    ))
                ) : (
                    <Box>
                        {data.map((d, idx) => (
                            <FilterRow
                                filterValue={d}
                                setReset={setResetFields}
                                idx={idx}
                                setDt={(valueData) => {
                                    setData((dt) => {
                                        let arr = [...dt]
                                        arr[idx] = valueData
                                        return arr
                                    })
                                }}
                                removeDt={() => {
                                    setData((dt) => {
                                        let arr = [...dt]
                                        arr.splice(idx, 1)
                                        return arr
                                    })
                                }}
                            />
                        ))}
                    </Box>
                )}
            </Stack>
            <Stack direction='row' justifyContent='flex-end' marginTop={1}>
                <Button
                    variant='contained'
                    color='success'
                    startIcon={<Search />}
                    sx={{
                        textTransform: 'capitalize',
                    }}
                    onClick={(e) => {
                        filtrar(data)
                        MODAL.close()
                    }}
                >
                    Filtrar
                </Button>
            </Stack>
        </Box>
    )
}

function FilterRow({
    filterValue,
    setDt,
    removeDt,
    idx,
    setReset,
}: {
    filterValue: FilterValue
    setDt: (value: any) => void
    removeDt: () => void
    idx: number
    setReset: React.Dispatch<React.SetStateAction<boolean>>
}) {
    const [currentOperator, setCurrentOperator] = useState(filterValue.operator)
    const [data, setData] = useState<FilterValue>(filterValue)
    const theme = useTheme()
    const isSmall = useMediaQuery(theme.breakpoints.only('xs'))

    useEffect(() => {
        setDt(data)
    }, [data])

    return (
        <Stack direction='row' alignItems='end' spacing={1} width='100%' bgcolor={idx % 2 === 0 ? '#ededed' : 'inherit'} padding={0.5} borderRadius={2}>
            {!isSmall && (
                <Typography width='100%' alignContent='center' fontWeight={600} color='#323232'>
                    {filterValue.label}
                </Typography>
            )}
            <FormControl
                sx={{
                    width: '100%',
                }}
            >
                {isSmall && <Typography>{filterValue.label}</Typography>}
                <Select
                    onChange={(e) => {
                        const value = e.target.value

                        setData((obj) => ({ ...obj, operator: value as FilterOperators, value: '' }))
                        setCurrentOperator(value as FilterOperators)
                    }}
                    defaultValue={currentOperator}
                    size='small'
                    sx={{
                        bgcolor: 'white',
                    }}
                    fullWidth
                >
                    {filterValue.operators.map((x) => (
                        <MenuItem value={x}>{x}</MenuItem>
                    ))}
                </Select>
            </FormControl>
            <FilterField
                filterValue={filterValue}
                operator={data.operator}
                onChange={(value, type: 'value' | 'value2' = 'value') => {
                    setData((obj) => ({ ...obj, [type]: value }))
                }}
            />
            {/* <IconButton
                onClick={(e) => {
                    setDt({ ...data, value: '' })
                    setReset((s) => !s)
                }}
            >
                <Refresh />
            </IconButton> */}
        </Stack>
    )
}

function FilterField({ filterValue, operator, onChange }: { filterValue: FilterValue; operator: FilterOperators; onChange: (value: string | any[], type?: 'value' | 'value2') => void }) {
    switch (filterValue.type) {
        case 'number':
            return (
                <TextField
                    type='number'
                    size='small'
                    placeholder='Valor'
                    defaultValue={filterValue.value}
                    onChange={(e) => {
                        onChange(e.target.value)
                    }}
                    sx={{
                        bgcolor: 'white',
                    }}
                    fullWidth
                />
            )
        case 'string':
            if (filterValue.useList) {
                switch (operator) {
                    case 'tem um dos':
                        return (
                            <Autocomplete
                                multiple
                                id='tags-standard'
                                onChange={(e, value) => {
                                    if (value.length <= 0) {
                                        onChange('')
                                        return
                                    }

                                    onChange(value)
                                }}
                                options={filterValue.useList}
                                defaultValue={Array.isArray(filterValue.value) ? filterValue.value : []}
                                renderInput={(params) => <TextField {...params} variant='standard' placeholder='Escolha os valores' fullWidth />}
                                fullWidth
                            />
                        )
                    case 'contem':
                        return (
                            <Box width='100%'>
                                <Autocomplete
                                    options={filterValue.useList}
                                    onChange={(e, value) => {
                                        onChange(value as any)
                                    }}
                                    defaultValue={typeof filterValue.value === 'object' ? filterValue.value : undefined}
                                    isOptionEqualToValue={(option, value) => option.label === value.label}
                                    renderInput={(params) => (
                                        <TextField
                                            {...params}
                                            size='small'
                                            placeholder='Escolha um valor'
                                            fullWidth
                                            sx={{
                                                bgcolor: 'white',
                                            }}
                                        />
                                    )}
                                    fullWidth
                                />
                            </Box>
                        )
                }
            }

            return (
                <TextField
                    size='small'
                    placeholder='Valor'
                    defaultValue={filterValue.value}
                    onChange={(e) => {
                        onChange(e.target.value)
                    }}
                    sx={{
                        bgcolor: 'white',
                    }}
                    fullWidth
                />
            )
        case 'date':
        case 'dates':
            switch (operator) {
                case 'data exata':
                case 'data fim':
                case 'data inicio':
                case 'tem a data':
                    return (
                        <LocalizationProvider adapterLocale={'pt-br'} dateAdapter={AdapterDayjs}>
                            <DatePicker
                                format='DD/MM/YYYY'
                                onChange={(dt: any) => {
                                    onChange(dt.isValid() ? dt.format('DD/MM/YYYY') : '')
                                }}
                                defaultValue={filterValue.value ? dayjs(filterValue.value as string, 'DD/MM/YYYY') : undefined}
                                sx={{
                                    div: {
                                        input: {
                                            paddingX: 2,
                                            paddingY: 1.05,
                                        },
                                    },
                                    width: '100%',
                                    bgcolor: 'white',
                                }}
                                inputRef={(params: any) => <TextField {...params} size='small' fullWidth />}
                            />
                        </LocalizationProvider>
                    )
                case 'entre':
                    return (
                        <LocalizationProvider adapterLocale={'pt-br'} dateAdapter={AdapterDayjs}>
                            <DatePicker
                                format='DD/MM/YYYY'
                                onChange={(dt: any) => {
                                    onChange(dt.isValid() ? dt.format('DD/MM/YYYY') : '')
                                }}
                                defaultValue={filterValue.value ? dayjs(filterValue.value as string, 'DD/MM/YYYY') : undefined}
                                sx={{
                                    div: {
                                        input: {
                                            paddingX: 2,
                                            paddingY: 1.05,
                                        },
                                    },
                                    width: '100%',
                                    bgcolor: 'white',
                                }}
                                inputRef={(params: any) => <TextField {...params} size='small' fullWidth />}
                            />
                            <DatePicker
                                format='DD/MM/YYYY'
                                onChange={(dt: any) => {
                                    onChange(dt.isValid() ? dt.format('DD/MM/YYYY') : '', 'value2')
                                }}
                                defaultValue={filterValue.value2 ? dayjs(filterValue.value2 as string, 'DD/MM/YYYY') : undefined}
                                sx={{
                                    div: {
                                        input: {
                                            paddingX: 2,
                                            paddingY: 1.05,
                                        },
                                    },
                                    width: '100%',
                                    bgcolor: 'white',
                                }}
                                inputRef={(params: any) => <TextField {...params} size='small' fullWidth />}
                            />
                        </LocalizationProvider>
                    )
            }
            break
    }

    return <></>
}

export default React.memo(Table)
