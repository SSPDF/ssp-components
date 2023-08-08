import AddIcon from '@mui/icons-material/Add'
import FileDownloadIcon from '@mui/icons-material/FileDownload'
import SearchIcon from '@mui/icons-material/Search'
import { Autocomplete, Box, Button, CircularProgress, LinearProgress, Link, Paper, Stack, useMediaQuery, useTheme } from '@mui/material'
import Grid from '@mui/material/Grid'
import Pagination from '@mui/material/Pagination'
import TextField from '@mui/material/TextField'
import Typography from '@mui/material/Typography'
import get from 'lodash.get'
import React, { ChangeEvent, useCallback, useContext, useEffect, useState } from 'react'
import { AuthData } from '../../../types/auth'
import { AuthContext } from '../../../context/auth'

interface ColumnData {
    title: string
    keyName: string
}

export function Table({
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
    isPublic = false,
    statusKeyName = '',
    csvExcludeKeys = [],
    csvCustomKeyNames = {},
    csvExcludeValidate = (key, value) => false,
    csvButtonTitle = 'Salvar .CSV',
    csvAllButtonTitle = 'Salvar todos em CSV',
    csvShowAllButton = false,
    itemCount = 10,
}: {
    columns: ColumnData[]
    tableName: string
    csvShowAllButton?: boolean
    csvAllButtonTitle?: string
    csvButtonTitle?: string
    csvExcludeValidate?: (key: string, value: string | number) => boolean
    csvCustomKeyNames?: {
        [key: string]: string
    }
    csvExcludeKeys?: string[]
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
    isPublic?: boolean
    filters?: { type: ''; options?: object[] }
}) {
    const [isLoading, setIsLoading] = useState(true)
    const [error, setError] = useState<null | { status: number }>(null)
    const [data, setData] = useState<any>(null)
    const { user, userLoaded } = useContext(AuthContext)
    const [list, setList] = useState<any>([])
    //numero de items pra ser mostrado
    const [itemsCount, setItemsCount] = useState(itemCount)
    const [currentPage, setCurrentPage] = useState(0)
    const [paginationCount, setPagCount] = useState(1)
    const [listPage, setListPage] = useState(1)

    const [gridSize, setGridSize] = useState<number>(12)

    const theme = useTheme()
    const isSmall = useMediaQuery(theme.breakpoints.only('xs'))

    useEffect(() => {
        if (userLoaded || isPublic)
            fetchFunc()
                .then((res) => {
                    if (!res.ok)
                        setError({
                            status: 500,
                        })

                    return res.json().then((j) => {
                        if (j.statusCode === 204) setData({ body: { data: [] } })
                        else if (j.statusCode === 403)
                            setError({
                                status: j.statusCode,
                            })
                        else setData(j)

                        console.log(j.statusCode)

                        setIsLoading(false)
                    })
                })
                .catch((err) => {
                    setError({
                        status: 500,
                    })
                })
    }, [userLoaded])

    useEffect(() => {
        setGridSize(12 / (columns.length + (user ? 1 : 0)))
    }, [user, columns])

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

            // setList([])
            // setListPage(1)

            console.log(listData)

            const newList: any = []

            listData.forEach((x: any) => {
                const dataStr: string[] = []

                Object.keys(x).map((key: string) => {
                    let value = x[key]

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
                        }
                    }

                    if (key.toLowerCase().includes(searchValue.toLowerCase())) {
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

    // download file
    const downloadCSV = useCallback(
        (e: React.MouseEvent) => {
            e.preventDefault()

            if (list.length <= 0) return

            const originalKeys = Object.keys(list[0])
            const keys = originalKeys.filter((k) => !csvExcludeKeys.includes(k))
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
                            if (k === 'tbRa') return x[k]['NO_CIDADE']
                            if (k === 'rlEventoData') return `${x[k][0]['DT_INICIO']} - ${x[k][0]['HR_INICIO']}`

                            if (typeof x[k] === 'string') return `"${x[k]}"`

                            return x[k]
                        })
                        .join(',')

                    values.push(value)
                }
            })

            const csvData = header + values.join('\n')

            // download
            var link = window.document.createElement('a')
            link.setAttribute('href', 'data:text/csv;charset=utf-8,%EF%BB%BF' + encodeURI(csvData))
            link.setAttribute('download', `${csv?.fileName}.csv`)
            link.click()
        },
        [list]
    )

    const downloadCSVAll = useCallback(
        (e: React.MouseEvent) => {
            e.preventDefault()

            if (list.length <= 0) return

            const keys = Object.keys(list[0])
            const header = keys.join(',') + '\n'

            const values = list
                .map((x: any) => {
                    return keys
                        .map((k: string) => {
                            if (k === 'tbRa') return x[k]['NO_CIDADE']
                            if (k === 'rlEventoData') return `${x[k][0]['DT_INICIO']} - ${x[k][0]['HR_INICIO']}`

                            if (typeof x[k] === 'string') return `"${x[k]}"`

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

    const getStatusMsg = useCallback((cod: string) => {
        switch (cod) {
            case 'P':
                return (
                    <Typography color='#F59E0B' fontWeight={600} fontFamily='Inter'>
                        EM ANÁLISE
                    </Typography>
                )
            case 'A':
                return (
                    <Typography color='#0EA5E9' fontWeight={600} fontFamily='Inter'>
                        CADASTRADO
                    </Typography>
                )
            case 'C':
                return (
                    <Typography color='#a1a1a1' fontWeight={600} fontFamily='Inter'>
                        CANCELADO
                    </Typography>
                )
            case 'R':
                return (
                    <Typography color='#EF4444' fontWeight={600} fontFamily='Inter'>
                        REPROVADO
                    </Typography>
                )
            case 'L':
                return (
                    <Typography color='#22C55E' fontWeight={600} fontFamily='Inter'>
                        LICENCIADO
                    </Typography>
                )
            case 'PA':
                return (
                    <Typography color='#6366F1' fontWeight={600} fontFamily='Inter'>
                        PRÉ APROVADO
                    </Typography>
                )
        }
    }, [])

    const onFilterSelect = useCallback(
        (key: string, newValue: string | null) => {
            if (!newValue) {
                setList(getData(data))
                setPagCount(getCount(getData(data)))
                return
            }

            const listData: object[] = getData(data)
            const newList: any[] = []

            listData.forEach((l) => {
                if (get(l, key).toString() === newValue) newList.push(l)
            })

            setList(newList)
            setPagCount(getCount(newList))
        },
        [data]
    )

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

    if (!userLoaded && !isPublic) return <LinearProgress />

    return (
        <>
            <Box marginX={isSmall ? 0 : 4}>
                <Stack spacing={2} direction={{ xs: 'column', md: 'row' }}>
                    <TextField
                        InputProps={{
                            startAdornment: <SearchIcon sx={{ marginRight: 1, fill: '#c0c0c0' }} />,
                        }}
                        size='small'
                        onChange={onInputChange}
                        fullWidth
                        placeholder={`Pesquisar ${tableName}`}
                    />
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
                            <Paper key={index} sx={{ padding: 0.5, backgroundColor: index % 2 === 0 ? '#E2E8F0' : '#F8FAFC', paddingY: 2 }} elevation={0}>
                                <Grid container spacing={isSmall ? 2 : 0} paddingX={2}>
                                    {columns.map((c) => (
                                        <Grid key={c.keyName + index} item xs={12} md={12 / columnSize}>
                                            <Box sx={{ width: 'max-content', paddingX: 1 }}>
                                                <Typography fontSize={16} fontWeight={700} color='#1E293B' fontFamily='Inter'>
                                                    {c.title}
                                                </Typography>
                                            </Box>
                                            <Box paddingLeft={1}>
                                                <Typography fontSize={16} sx={{ wordWrap: 'break-word', color: '#1E293B' }} fontFamily='Inter'>
                                                    {c.keyName === statusKeyName ? getStatusMsg(get(x, c.keyName)) : get(x, c.keyName)}
                                                </Typography>
                                            </Box>
                                        </Grid>
                                    ))}
                                    <Grid item xs={12} md={12 / columnSize}>
                                        <Stack direction='row' alignItems='center' justifyContent={isSmall ? 'start' : 'flex-end'} sx={{ height: '100%', paddingBottom: isSmall ? 2 : 0 }}>
                                            {action(x)}
                                        </Stack>
                                    </Grid>
                                </Grid>
                            </Paper>
                        ))
                    )}
                    <Stack bgcolor='#F8FAFC' direction='row' justifyContent='center' paddingY={1} borderTop={3} borderColor='#b4bfcf'>
                        <Stack direction='column' justifyContent='center' alignItems='center'>
                            <Pagination count={paginationCount} siblingCount={isSmall ? 0 : 1} size='large' onChange={onPaginationChange} page={listPage} shape='rounded' />
                        </Stack>
                    </Stack>
                </Stack>
                {getMaxItems().length > 0 && (
                    <Stack
                        bgcolor='#E2E8F0'
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
                        <Box height='100%' top={0} left={0} marginLeft={2}>
                            <Stack height='100%' justifyContent='center'>
                                {currentPage * itemsCount + 1}-{currentPage * itemsCount + 1 + getMaxItems().length - 1} de {list.length}
                            </Stack>
                        </Box>
                        {csv && (
                            <Stack
                                direction={{
                                    xs: 'column',
                                    md: 'row',
                                }}
                                justifyContent='flex-end'
                                spacing={1}
                            >
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
                                    onClick={downloadCSV}
                                    sx={{ backgroundColor: '#22C55E', marginRight: { xs: 2, md: 0 }, width: { xs: '100%', md: 'fit-content' } }}
                                >
                                    {csvButtonTitle}
                                </Button>
                            </Stack>
                        )}
                    </Stack>
                )}
            </Box>
        </>
    )
}

export default React.memo(Table)
