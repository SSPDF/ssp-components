import { TableErrorState } from './TableErrorState'
import { ExpandLess, ExpandMore, FilterAlt, KeyboardArrowDown, KeyboardArrowUp, ReportProblemRounded } from '@mui/icons-material'
import Clear from '@mui/icons-material/Clear'
import FileDownloadIcon from '@mui/icons-material/FileDownload'
import NavigateNextRoundedIcon from '@mui/icons-material/NavigateNextRounded'
import { default as SearchIcon } from '@mui/icons-material/Search'
import { Box, Button, Collapse, IconButton, LinearProgress, PaginationItem, Paper, Stack, useMediaQuery, useTheme } from '@mui/material'
import Grid from '@mui/material/Grid'
import Pagination from '@mui/material/Pagination'
import TextField from '@mui/material/TextField'
import Typography from '@mui/material/Typography'
import get from 'lodash.get'
import React, { ChangeEvent, useCallback, useContext, useEffect, useRef, useState } from 'react'
import { AuthContext } from '../../../context/auth'
import { MODAL } from '../../modal/Modal'
import CustomMenu from '../../utils//CustomMenu'
import { FilterValue, OrderBy, TableProps } from './types'
import { TableLoadingState } from './TableLoadingState'
import { removePunctuationAndAccents, getCount, filtrarDados, ordenarDados, downloadCSVFile, downloadCSVAll } from './utils'
import { FilterMenu } from './FilterSection'

let isExpandAll: boolean = false
let localTableName = ''
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
    tableName = 'Dado',
    csvConfig = {
        fileName: tableName,
        map: []
    },
    csv,
    columnSize,
    action,
    useKC = true,
    itemCount = 10,
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
    isExpandable = true,
}: TableProps) {
    const [isLoading, setIsLoading] = useState(false)
    const [error, setError] = useState<null | { status: number }>(null)
    const [data, setData] = useState<any>(initialData)
    /** startData Dado puro, sem filtro ou ordenação */
    const { user, userLoaded } = useContext(AuthContext)
    const [list, setList] = useState<any[]>([])
    const [listClone, setListClone] = useState<any[]>([])
    //numero de items pra ser mostrado
    const [itemsCount, setItemsCount] = useState(itemCount)
    const [currentPage, setCurrentPage] = useState(0)
    const [paginationCount, setPagCount] = useState(1)
    const [listPage, setListPage] = useState(1)
    const [expandObj, setExpandObj] = useState<{ [key: number]: boolean }>({})
    const [showExpandObj, setShowExpandObj] = useState<{ [key: number]: boolean }>({})
    const [showExpandObjOnExited, setShowExpandObjOnExited] = useState<{ [key: number]: boolean }>({})
    const [filterKey, setFilterKey] = useState('filterKey')
    const theme = useTheme()
    const isSmall = useMediaQuery(theme.breakpoints.only('xs'))
    const startData = useRef<any[]>(data)
    const orderAsc = useRef((localStorage.getItem(`order-${id}`) === 'true') || false)
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
        if (!fetchFunc) return
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
                            startData.current = []
                        } else if (j.statusCode === 403)
                            setError({
                                status: j.statusCode,
                            })
                        else {
                            let value = dataPath ? get(j, dataPath) : j

                            if (!value || !Array.isArray(value)) {
                                setData({ body: { data: [] } })
                                startData.current = []
                            } else {
                                let newValue: any[] = value
 
                                // começando a ordenação padrão
                                if (localStorage.getItem(`order-data-${id}`)) {
                                    try {
                                        const orderData: OrderBy = JSON.parse(localStorage.getItem(`order-data-${id}`))

                                        newValue = ordenarDados({
                                            order: orderData,
                                            list: value,
                                            orderAsc: orderAsc.current,
                                        })
                                    } catch(err){
                                        console.log(err)
                                    }
                                }
                                else if (orderBy.length > 0) {
                                    // se não tiver salvo uma ordenação, ordena pelo primeiro da lista
                                    newValue = ordenarDados({
                                        order: orderBy[0],
                                        list: value,
                                        orderAsc: orderAsc.current,
                                    })
                                }

                                setData(newValue)
                                startData.current = JSON.parse(JSON.stringify(newValue))
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

    const getData = useCallback((dt: any) => {
        if (Array.isArray(dt)) return dt

        if (typeof dt === 'object') return get(dt, dataPath)
    }, [])

    useEffect(() => {
        if (isLoading || error || !getData(data)) return

        let value = getData(data)

        setList(value)
        setListClone(value)
        setPagCount(getCount(value, itemsCount))

        if (localStorage.getItem(localTableName)) {
            filtrarDados({
                filterData: JSON.parse(localStorage.getItem(localTableName) as string) as FilterValue[],
                filtersFuncData: filtersFuncData,
                localTableName: localTableName,
                setCurrentPage: setCurrentPage,
                setList,
                setListClone,
                setListPage,
                setPagCount,
                startData: startData.current,
                itemsCount,
            })
        }
    }, [itemsCount, isLoading, data, error])

    useEffect(() => {
        setCurrentPage(listPage - 1)
    }, [listPage])

    const onPaginationChange = useCallback((e: ChangeEvent<unknown>, page: number) => {
        setListPage(page)
    }, [])

    function onInputChange(e: ChangeEvent) {
        const searchValue = (e.target as HTMLInputElement).value

        if (searchValue === '') {
            setList(listClone)
            setPagCount(getCount(getData(list), itemsCount))
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
        setPagCount(getCount(newList, itemsCount))
        setCurrentPage(0)
        setListPage(1)
    }

    const getMaxItems = useCallback(() => {
        const start = currentPage * itemsCount
        return list.slice(start, start + itemsCount)
    }, [list, itemsCount, currentPage])

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
        setList(startData.current)
        setListClone(startData.current)
        setPagCount(getCount(startData.current, itemsCount))
        setCurrentPage(0)
        setListPage(1)
        localStorage.removeItem(localTableName)
        setFilterKey(new Date().getTime().toString())
    }

    const handleCSVDownload = (list: any[]) => {
        downloadCSVFile(list, csvConfig, (JSON.parse(localStorage.getItem(localTableName) ?? '[]') as FilterValue[]) || [])
    }

    const handleFiltrarDados = (dt: FilterValue[]) => {
        filtrarDados({
            filterData: dt,
            filtersFuncData: filtersFuncData,
            localTableName: localTableName,
            setCurrentPage: setCurrentPage,
            setList,
            setListClone,
            setListPage,
            setPagCount,
            startData: startData.current,
            itemsCount,
        })
    }

    const handleOrdenarDados = (x: OrderBy) => {
        /** Inverter a ordem de ordenação no segundo clique */
        orderAsc.current = !orderAsc.current

        const dadosOrdenados = ordenarDados({
            order: x,
            list,
            orderAsc: orderAsc.current,
        })

        localStorage.setItem(`order-${id}`, orderAsc.current.toString())
        localStorage.setItem(`order-data-${id}`, JSON.stringify(x))

        setList(dadosOrdenados)
    }

    if (error) return <TableErrorState customErrorMsg={customErrorMsg} error={error} />
    if (isLoading) return <TableLoadingState tableName={tableName} />
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

                        <Button
                            startIcon={<FilterAlt />}
                            variant='contained'
                            onClick={(e) =>
                                MODAL.open(
                                    <FilterMenu
                                        key={filterKey}
                                        reset={reset}
                                        filtrar={(dt) => handleFiltrarDados(dt)}
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
                            {orderBy.length > 0 && <CustomMenu
                                data={orderBy.map((x) => ({
                                    name: x.label,
                                    onClick: () => handleOrdenarDados(x),
                                }))}
                                btProps={{
                                    startIcon: <KeyboardArrowDown />,
                                    fullWidth: true,
                                }}
                            >
                                Ordenar
                            </CustomMenu>}

                            {isExpandable && (
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
                            )}
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

                                            handleFiltrarDados(currentValue)
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
                                {
                                    (JSON.parse(localStorage.getItem(localTableName) ?? '[]') as FilterValue[])
                                    .filter((x) => x.value || (x.operator === 'entre' && (x.value || x.value2))).length > 0 &&

                                    <Button
                                        startIcon={<FileDownloadIcon />}
                                        variant='contained'
                                        size='small'
                                        onClick={(e) => handleCSVDownload(list)}
                                        sx={{ backgroundColor: '#a5a5a5', marginRight: { xs: 2, md: 0 }, width: { xs: '100%', md: 'fit-content' } }}
                                    >
                                        Baixar Filtrados
                                    </Button>
                                }
                                <Button
                                    startIcon={<FileDownloadIcon />}
                                    variant='contained'
                                    size='small'
                                    onClick={(e) => handleCSVDownload(startData.current)}
                                    sx={{ backgroundColor: '#22C55E', marginRight: { xs: 2, md: 0 }, width: { xs: '100%', md: 'fit-content' } }}
                                >
                                    Baixar Tabela
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

export default React.memo(Table)
