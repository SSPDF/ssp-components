import { Refresh } from '@mui/icons-material'
import { default as Search } from '@mui/icons-material/Search'
import { Alert, Autocomplete, Box, Button, FormControl, Menu, MenuItem, Select, Stack, useMediaQuery, useTheme } from '@mui/material'
import TextField from '@mui/material/TextField'
import Typography from '@mui/material/Typography'
import { DatePicker, LocalizationProvider } from '@mui/x-date-pickers'
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs'
import dayjs from 'dayjs'
import React, { useEffect, useState } from 'react'
import { MODAL } from '../../modal/Modal'
import { FilterOperators, FilterValue } from './types'

export function FilterMenu({ filters, baseFilters, filtrar, reset }: { reset: () => void; filtrar: (dt: FilterValue[]) => void; filters: FilterValue[]; baseFilters: FilterValue[] }) {
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
                    case 'igual':
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
                                inputRef={((params: any) => <TextField {...params} size='small' fullWidth />) as any}
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
                                inputRef={((params: any) => <TextField {...params} size='small' fullWidth />) as any}
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
                                inputRef={((params: any) => <TextField {...params} size='small' fullWidth />) as any}
                            />
                        </LocalizationProvider>
                    )
            }
            break
    }

    return <></>
}
