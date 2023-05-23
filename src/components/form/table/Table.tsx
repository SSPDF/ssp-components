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
    tableName,
    csv,
    columnSize,
    action,
    isPublic = false,
    filters,
    statusKeyName = '',
    csvExcludeKeys = [],
    csvCustomKeyNames = {},
    csvExcludeValidate = (key, value) => false,
    csvButtonTitle = 'Salvar .CSV',
    csvAllButtonTitle = 'Salvar Tudo como CSV',
    csvShowAllButton = false,
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
    action: (prop: any) => JSX.Element
    csv?: {
        fileName: string
    }
    columnSize: number
    fetchFunc: () => Promise<Response>
    emptyMsg?: { user: string; public: string }
    dataPath?: string
    isPublic?: boolean
    filters?: { key: string; options: string[]; name: string }[]
}) {
    const [isLoading, setIsLoading] = useState(true)
    const [error, setError] = useState<null | { status: number }>(null)
    const [data, setData] = useState<any>(null)
    const { user, userLoaded } = useContext(AuthContext)

    useEffect(() => {
        if (userLoaded || isPublic)
            fetchFunc().then((res) =>
                res.json().then((j) => {
                    if (j.statusCode === 204) setData({ body: { data: [] } })
                    else if (j.statusCode === 403)
                        setError({
                            status: j.statusCode,
                        })
                    else setData(j)

                    console.log(j.statusCode)

                    setIsLoading(false)
                })
            )
    }, [userLoaded])

    const [list, setList] = useState<any>([])
    //numero de items pra ser mostrado
    const [itemsCount, setItemsCount] = useState(20)
    const [currentPage, setCurrentPage] = useState(0)
    const [paginationCount, setPagCount] = useState(1)
    const [listPage, setListPage] = useState(1)

    const [gridSize, setGridSize] = useState<number>(12)

    useEffect(() => {
        setGridSize(12 / (columns.length + (user ? 1 : 0)))
    }, [user, columns])

    const theme = useTheme()
    const isSmall = useMediaQuery(theme.breakpoints.only('xs'))

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
                    const status = ['P', 'C', 'A', 'R']

                    if (status.includes(key)) {
                        switch (key) {
                            case 'P':
                                if ('pendente'.includes(searchValue.toLowerCase())) {
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
            const a = document.createElement('a')
            a.href = 'data:text/csv;charset=utf-8,' + csvData
            a.download = `${csv?.fileName}.csv`
            document.body.appendChild(a)
            a.click()
            document.body.removeChild(a)
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
            const a = document.createElement('a')
            a.href = 'data:text/csv;charset=utf-8,' + csvData
            a.download = `${csv?.fileName}.csv`
            document.body.appendChild(a)
            a.click()
            document.body.removeChild(a)
        },
        [list]
    )

    const getStatusMsg = useCallback((cod: string) => {
        switch (cod) {
            case 'P':
                return (
                    <Typography color='#F59E0B' fontWeight={600} fontFamily='Inter'>
                        PENDENTE
                    </Typography>
                )
            case 'A':
                return (
                    <Typography color='#22C55E' fontWeight={600} fontFamily='Inter'>
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
                <Stack paddingBottom={2} spacing={2} direction={{ xs: 'column', md: 'row' }}>
                    <TextField
                        InputProps={{
                            startAdornment: <SearchIcon sx={{ marginRight: 1, fill: '#c0c0c0' }} />,
                        }}
                        size='small'
                        onChange={onInputChange}
                        fullWidth
                        placeholder={`Pesquisar ${tableName}`}
                    />
                    {filters?.map((f) => (
                        <Autocomplete
                            options={f.options.map((name) => name)}
                            onChange={(e, newValue) => onFilterSelect(f.key, newValue)}
                            renderInput={(args) => <TextField {...args} label={f.name} size='small' />}
                        />
                    ))}
                </Stack>
                <Stack spacing={0.2}>
                    {getMaxItems().length <= 0 ? (
                        <Stack sx={{ backgroundColor: '#E2E8F0', padding: 2, borderRadius: 2, marginX: { xs: 2, md: 0 } }} justifyContent='center' alignItems='center'>
                            <Typography fontSize={21} fontFamily='Inter' fontWeight={600} textAlign='center'>
                                {user ? emptyMsg.user : emptyMsg.public}
                            </Typography>
                        </Stack>
                    ) : (
                        getMaxItems().map((x: any, index: number) => (
                            <Paper key={index} sx={{ padding: 0.5, borderRadius: 2, backgroundColor: index % 2 === 0 ? '#E2E8F0' : '#F8FAFC', paddingY: 2 }} elevation={0}>
                                <Grid container spacing={isSmall ? 2 : 0} paddingX={2}>
                                    {columns.map((c) => (
                                        <Grid key={c.keyName + index} item xs={12} md={12 / columnSize}>
                                            <Box sx={{ width: 'max-content', borderRadius: 1, paddingX: 1 }}>
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
                </Stack>
                {getMaxItems().length > 0 && (
                    <>
                        {csv && (
                            <Stack direction='row' justifyContent='flex-end' marginTop={2} spacing={1}>
                                {csvShowAllButton && (
                                    <Button
                                        startIcon={<FileDownloadIcon />}
                                        variant='contained'
                                        size='small'
                                        onClick={downloadCSVAll}
                                        sx={{ backgroundColor: '#64748B', marginRight: { xs: 2, md: 0 } }}
                                    >
                                        {csvAllButtonTitle}
                                    </Button>
                                )}
                                <Button startIcon={<FileDownloadIcon />} variant='contained' size='small' onClick={downloadCSV} sx={{ backgroundColor: '#22C55E', marginRight: { xs: 2, md: 0 } }}>
                                    {csvButtonTitle}
                                </Button>
                            </Stack>
                        )}
                        <Stack direction='row' justifyContent='center' paddingY={4}>
                            <Pagination count={paginationCount} siblingCount={isSmall ? 0 : 1} size='large' onChange={onPaginationChange} page={listPage} />
                        </Stack>
                    </>
                )}
            </Box>
        </>
    )
}

export default React.memo(Table)
