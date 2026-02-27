import { ExpandLess, ExpandMore, FilterAlt, KeyboardArrowDown, KeyboardArrowUp, PendingRounded, ReportProblemRounded } from '@mui/icons-material'
import Clear from '@mui/icons-material/Clear'
import FileDownloadIcon from '@mui/icons-material/FileDownload'
import NavigateNextRoundedIcon from '@mui/icons-material/NavigateNextRounded'
import SearchIcon from '@mui/icons-material/Search'
import { Box, Button, Collapse, IconButton, LinearProgress, PaginationItem, Paper, Skeleton, Stack, useMediaQuery, useTheme } from '@mui/material'
import Grid from '@mui/material/Grid'
import Pagination from '@mui/material/Pagination'
import TextField from '@mui/material/TextField'
import Typography from '@mui/material/Typography'
import JSZip from 'jszip'
import get from 'lodash.get'
import React, { ChangeEvent, useCallback, useContext, useEffect, useRef, useState } from 'react'
import { AuthContext } from '../../../context/auth'
import { MODAL } from '../../modal/Modal'
import CustomMenu from '../../utils/CustomMenu'
import { FilterValue, OrderBy, TableProps2 } from './types'
import { FilterMenu } from './FilterSection'
import { filtrarDados, ordenarDados, removePunctuationAndAccents, getCount, transformArrayObjectInString } from './utils'

/**
 * Tabela cujo dados devem ser passados via props
 */
export function GenericTable({
    mediaQueryLG,
    columns,
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
    csvExcludeKeys = [],
    csvExcludeKeysCSV = [],
    csvExcludeKeysAll = [],
    csvCustomKeyNames = {},
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
    customErrorMsg = undefined,
    customTableStyle = {},
    id,
    initialData = null,
    isLoading,
    alwaysExpanded = false,
    totalCount,
    pageLimit,
}: TableProps2) {
    const [error] = useState<null | { status: number }>(null)
    const [data, setData] = useState<any>(initialData)

    const { user, userLoaded } = useContext(AuthContext)
    const [list, setList] = useState<any[]>([])
    const [listClone, setListClone] = useState<any[]>([])
    //numero de items pra ser mostrado
    const [itemsCount] = useState(pageLimit ?? itemCount)
    const [currentPage, setCurrentPage] = useState(0)
    const [paginationCount, setPagCount] = useState(1)
    const [listPage, setListPage] = useState(1)
    const [expandObj, setExpandObj] = useState<{ [key: number]: boolean }>({})
    const [showExpandObj, setShowExpandObj] = useState<{ [key: number]: boolean }>({})
    const [showExpandObjOnExited, setShowExpandObjOnExited] = useState<{ [key: number]: boolean }>({})
    const [filterKey, setFilterKey] = useState('filterKey')
    const theme = useTheme()
    const isSmall = useMediaQuery(theme.breakpoints.only('xs'))
    const filterContainer = useRef(null)

    const lg = useMediaQuery(theme.breakpoints.up(2000))

    const startData = useRef<any[]>([])
    const isExpandAll = useRef<boolean>(false)
    const localTableName = `tableFilter_${id}`
    const localTableNameCache = `tableFilterCache_${id}`
    const orderAsc = useRef<boolean>(false)
    const filtersFuncData = filtersFunc ?? {}

    useEffect(() => {
        setData(initialData)
    }, [initialData])

    useEffect(() => {
        if (!localStorage.getItem(localTableNameCache)) localStorage.setItem(localTableNameCache, JSON.stringify(filters))

        if (localStorage.getItem(localTableNameCache) !== JSON.stringify(filters)) {
            localStorage.setItem(localTableNameCache, JSON.stringify(filters))
            localStorage.removeItem(localTableName)
        }
    }, [filters, localTableNameCache, localTableName])

    const getData = useCallback(
        (dt: any) => {
            if (Array.isArray(dt)) return dt

            if (typeof dt === 'object') return get(dt, dataPath)
        },
        [dataPath],
    )

    useEffect(() => {
        if (error || !getData(data)) return

        const value = getData(data)

        startData.current = JSON.parse(JSON.stringify(value))

        setList(value)
        setListClone(value)
        setPagCount(totalCount !== undefined ? Math.ceil(totalCount / itemsCount) : getCount(value, itemsCount))

        if (localStorage.getItem(localTableName)) {
            filtrar(JSON.parse(localStorage.getItem(localTableName) as string) as FilterValue[])
        }
    }, [itemsCount, data, error, getData, totalCount, localTableName])

    useEffect(() => {
        setCurrentPage(listPage - 1)
    }, [listPage])

    const onPaginationChange = useCallback((_e: ChangeEvent<unknown>, page: number) => {
        setListPage(page)
    }, [])

    function onInputChange(e: ChangeEvent) {
        console.log(listClone)
        const searchValue = (e.target as HTMLInputElement).value

        if (searchValue === '') {
            setList(listClone)
            setPagCount(totalCount !== undefined ? Math.ceil(totalCount / itemsCount) : getCount(getData(list), itemsCount))
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

        if (newList.length === 0) {
            setList([])
            setPagCount(1)
            return
        }
        setList(newList)
        setPagCount(totalCount !== undefined ? Math.ceil(totalCount / itemsCount) : getCount(newList, itemsCount))
        setCurrentPage(0)
        setListPage(1)
    }

    const getMaxItems = useCallback(() => {
        const start = currentPage * itemsCount
        return list.slice(start, start + itemsCount)
    }, [list, itemsCount, currentPage])

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
                })

                const csvData = header + values.join('\n')

                // download
                var link = window.document.createElement('a')
                link.setAttribute('href', 'data:text/csv;charset=utf-8,%EF%BB%BF' + encodeURI(csvData))
                link.setAttribute('download', `${csv?.fileName}.csv`)
                link.click()
            }
        },
        [list],
    )

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
        [list],
    )

    function expandAll() {
        let obj: { [key: number]: boolean } = {}

        for (let i = 0; i < itemsCount; i++) {
            obj[i] = !isExpandAll.current
        }

        setShowExpandObjOnExited(obj)
        setExpandObj(obj)

        isExpandAll.current = !isExpandAll.current
    }

    function reset() {
        setList(startData.current)
        setListClone(startData.current)
        setPagCount(totalCount !== undefined ? Math.ceil(totalCount / itemsCount) : getCount(startData.current, itemsCount))
        setCurrentPage(0)
        setListPage(1)
        localStorage.removeItem(localTableName)
        setFilterKey(new Date().getTime().toString())
    }

    const filtrar = useCallback(
        (filterData: FilterValue[]) => {
            filtrarDados({
                filterData,
                filtersFuncData,
                localTableName,
                setCurrentPage,
                setList,
                setListClone,
                setListPage,
                setPagCount,
                startData: startData.current,
                itemsCount,
            })
        },
        [filtersFuncData, localTableName, itemsCount],
    )

    const ordenar = useCallback(
        (order: OrderBy) => {
            const sortedList = ordenarDados({
                order,
                list,
                orderAsc: orderAsc.current,
            })

            orderAsc.current = !orderAsc.current
            setList(sortedList)
        },
        [list],
    )

    // effect usado quando for mostrar "VER MAIS" e "VER MENOS"
    useEffect(() => {
        const start = currentPage * itemsCount
        const newList = list.slice(start, start + itemsCount)
        let obj: { [key: number]: boolean } = {}

        newList.forEach((x, index) => {
            columns.forEach((c) => {
                obj[index] = obj[index] === true ? true : (get(x, c?.keyName as any, '') ?? 'Não Informado').toString().length >= expandTextMaxLength
            })
        })

        setShowExpandObj(obj)
    }, [list, itemsCount, currentPage])

    useEffect(() => {
        console.log(filterContainer.current)
    }, [filterContainer.current])

    if (error)
        return (
            <Box bgcolor='#fff2c8' color='#3e3129' padding={2} marginX={2} borderRadius={4}>
                <Typography fontSize={24} textAlign='center' fontFamily='Inter'>
                    {error.status === 403 && 'Acesso negado'}
                    {error.status === 500 && (
                        <Box fontWeight={500} textAlign='center'>
                            <ReportProblemRounded sx={{ transform: 'scale(2)', marginY: 1, fill: '#3e3129' }} />
                            <Box>
                                {customErrorMsg ? (
                                    customErrorMsg
                                ) : (
                                    <>
                                        Não foi possível se conectar ao servidor no momento. Por favor, aguarde alguns instantes e tente de novo.
                                        <br />
                                        <br />
                                        Caso precise de ajuda, entre em contato pelo email: <strong>cdes@ssp.df.gov.br</strong>
                                    </>
                                )}
                            </Box>
                        </Box>
                    )}
                </Typography>
            </Box>
        )
    if (isLoading)
        return (
            <Stack sx={{ height: '100%', width: '100%' }} justifyContent='center' alignItems='center'>
                <Box width='100%'>
                    <Stack direction='row' justifyContent='center' alignItems='center' justifyItems='center' spacing={2} marginY={4}>
                        <PendingRounded sx={{ fill: '#5e5e5e' }} />
                        <Typography fontWeight={600} fontSize={20} textTransform='capitalize' textAlign='center' color='#5e5e5e'>
                            Carregando {tableName}
                        </Typography>
                    </Stack>
                    <LinearProgress color='inherit' />
                    {Array(10)
                        .fill('')
                        .map((_x, idx1) => (
                            <Stack
                                key={idx1}
                                direction={{
                                    xs: 'column',
                                    md: 'row',
                                }}
                                spacing={{
                                    xs: 3,
                                    md: 1,
                                }}
                                justifyContent='space-between'
                                paddingY={8}
                                borderBottom='1px solid #cacaca'
                            >
                                {Array(7)
                                    .fill(0)
                                    .map((_y, idx2) => (
                                        <Box key={idx2}>
                                            <Skeleton width={60} />
                                            <Skeleton width={120} />
                                        </Box>
                                    ))}
                            </Stack>
                        ))}
                </Box>
            </Stack>
        )

    if (!userLoaded && useKC) return <LinearProgress />

    return (
        <>
            <Box marginX={isSmall ? customMarginMobile : customMargin} bgcolor='white' p={2} borderRadius={6} {...customTableStyle}>
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

                        {filters.length > 0 && (
                            <Button
                                startIcon={<FilterAlt />}
                                variant='contained'
                                onClick={() =>
                                    MODAL.open(
                                        <FilterMenu
                                            key={filterKey}
                                            reset={reset}
                                            filtrar={filtrar}
                                            baseFilters={[...filters]}
                                            filters={localStorage.getItem(localTableName) ? (JSON.parse(localStorage.getItem(localTableName)!) as FilterValue[]) : [...filters]}
                                        />,
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
                        )}

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
                                Exibindo {currentPage * itemsCount + 1}-{currentPage * itemsCount + 1 + getMaxItems().length - 1} de {totalCount ? totalCount : list.length}
                            </Typography>
                        </Stack>
                    </Stack>
                </Stack>

                {localStorage.getItem(localTableName) && (
                    <Box display='inline-flex' flexWrap='wrap' padding={0.5} borderRadius={4} marginBottom={1}>
                        {(JSON.parse(localStorage.getItem(localTableName) ?? '[]') as FilterValue[])
                            .filter((x) => x.value || (x.operator === 'entre' && (x.value || x.value2)))
                            .map((x) => (
                                <Stack direction='row' spacing={1} bgcolor='#4e85c1' color='white' width='fit-content' paddingY={0.5} borderRadius={2} paddingX={1} m={0.5}>
                                    <Typography fontWeight={700}>{x.label}</Typography>
                                    <Typography fontStyle='italic'>{x.operator}</Typography>
                                    <Typography bgcolor='white' borderRadius={2} paddingX={1} color='black'>
                                        {Array.isArray(x.value)
                                            ? (x.value as { id: string; label: string }[]).map((x) => x.label).join(' - ')
                                            : typeof x.value === 'object'
                                              ? (x.value as { id: string; label: string }).label
                                              : x.operator === 'entre'
                                                ? `${x.value ? x.value : 'Antes'} e ${x.value2 ? x.value2 : 'Depois'}`
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
                                    paddingBottom: alwaysExpanded ? 2 : 0.5,
                                    borderTop: 'solid 1.5px #E2E8F0',
                                    position: 'relative',
                                }}
                                elevation={0}
                            >
                                <Grid container spacing={isSmall ? 2 : 0} paddingX={2} rowSpacing={2}>
                                    {columns.map((c) => (
                                        <Grid
                                            key={String(c?.keyName) + index}
                                            item
                                            xs={12}
                                            md={lg ? (12 / columnSize) * (!!c.size ? c.size : 1) : mediaQueryLG ? mediaQueryLG.all : (12 / columnSize) * (!!c.size ? c.size : 1)}
                                            sx={{
                                                overflow: 'hidden',
                                            }}
                                        >
                                            <Box sx={{ width: '100%', paddingX: 1 }}>
                                                <Typography fontSize={16} fontWeight={700} color='#1E293B' fontFamily='Inter'>
                                                    {c.title}
                                                </Typography>
                                            </Box>
                                            <Box paddingLeft={1}>
                                                <Collapse
                                                    in={alwaysExpanded || expandObj[index] === true}
                                                    collapsedSize={alwaysExpanded ? 'auto' : collapsedSize}
                                                    onExited={() => setShowExpandObjOnExited((s) => ({ ...s, [index]: false }))}
                                                >
                                                    <Box
                                                        sx={{
                                                            wordWrap: 'break-word',
                                                            color: '#1E293B',
                                                            fontSize: 16,
                                                        }}
                                                        fontFamily='Inter'
                                                    >
                                                        {c.customComponent ? (
                                                            c.customComponent(get(x, c.keyName as any), x)
                                                        ) : alwaysExpanded || expandObj[index] === true ? (
                                                            get(x, c?.keyName as any, '')
                                                        ) : (get(x, c?.keyName as any, '') ?? '').toString().length >= expandTextMaxLength ? (
                                                            <>{(get(x, c?.keyName as any, '') ?? '').toString().substring(0, expandTextMaxLength) + '...'}</>
                                                        ) : (
                                                            get(x, c?.keyName as any, '')
                                                        )}
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
                                    {showExpandObj[index] && !alwaysExpanded && (
                                        <Stack direction='row' justifyContent='flex-end' bottom={0} width='100%'>
                                            <Button
                                                onClick={() => {
                                                    setExpandObj((s) => ({ ...s, [index]: !s[index] }))
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

export default React.memo(GenericTable)
