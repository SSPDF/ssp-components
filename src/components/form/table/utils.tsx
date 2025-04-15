import get from 'lodash.get'
import { CsvConfigProp, CsvMapProps, FilterValue, OrderBy } from './types'
import dayjs from 'dayjs'
import JSZip from 'jszip'
import cloneDeep from 'lodash.clonedeep'
import * as XLSX from 'xlsx'


export const getCount = (countData: any[], itemsCount: number) => {
    if (countData.length <= 0) return 1

    let count = countData.length / itemsCount
    count = count < 1 ? 1 : count
    return Math.ceil(count)
}

export function transformArrayObjectInString(o: Object): String {
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

// export function defineCSVCells({ csvUpper, csvExcludeUpper }: DefineCSVCellsProps): string {
//     if (typeof cell === 'string') {
//         let item = csvUpper && !csvExcludeUpper.includes(key) ? (cell as string).toUpperCase() : cell
//         item = normalize ? item.normalize('NFD').replace(/[\u0300-\u036f]/g, '') : item
//         return removeQuotes ? `${item}` : `"${item}"`
//     } else if (typeof cell === 'object' && !Array.isArray(cell) && cell !== null) {
//         let strItemAsObject = transformArrayObjectInString(cell).slice(1, -1) // key: label (Ex.: jsNaturezaEvento)

//         let item = csvUpper && !csvExcludeUpper.includes(key) ? (strItemAsObject as string).toUpperCase() : strItemAsObject
//         item = normalize ? item.normalize('NFD').replace(/[\u0300-\u036f]/g, '') : item
//         return removeQuotes ? `${item}` : `"${item}"`
//     }

//     return cell
// }

export function removePunctuationAndAccents(text: string) {
    // Remove accents and diacritics
    const normalizedText = text.normalize('NFD').replace(/[\u0300-\u036f]/g, '')

    // Remove punctuation marks
    const cleanedText = normalizedText.replace(/[!"#$%&'()*+,\-./:;<=>?@[\\\]^_`{|}~]/g, '')

    return cleanedText
}

export function formatarString(str: string | number) {
    const value: string = typeof str !== 'string' ? str.toString() : str

    return value
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .toLowerCase()
        .trim()
}

interface FiltrarProps {
    startData: any[]
    filterData: FilterValue[]
    filtersFuncData: { [key: string]: (value: string) => any }
    localTableName: string
    setList: (arg: any) => void
    setPagCount: (arg: any) => void
    setCurrentPage: (arg: number) => void
    setListPage: (arg: number) => void
    setListClone: (arg: any) => void
    itemsCount: number
}

export function filtrarDados({ filterData, startData, filtersFuncData = {}, localTableName = '', setCurrentPage, setList, setListClone, setListPage, setPagCount, itemsCount }: FiltrarProps) {
    if (!startData) return

    let currentData: any[] = JSON.parse(JSON.stringify(startData))

    filterData
        .filter((dt) => dt.value || (dt.operator === 'entre' && (dt.value || dt.value2)))
        .forEach((dt) => {
            let filteredData: any[] = []

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
                    switch (dt.operator) {
                        case 'igual':
                            currentData.forEach((cd) => {
                                const value = get(cd, dt.keyName, '')

                                if (dt.useList) {
                                    if (formatarString(value) === formatarString(dt.value.id)) {
                                        filteredData.push(cd)
                                    }
                                } else {
                                    if (formatarString(value) === formatarString(dt.value)) {
                                        filteredData.push(cd)
                                    }
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
                            const dateA = dt.value ? dayjs(dt.value as string, 'DD/MM/YYYY') : dayjs('01/01/2000', 'DD/MM/YYYY')
                            const dateB = dt.value2 ? dayjs(dt.value2 as string, 'DD/MM/YYYY') : dayjs('31/12/2030', 'DD/MM/YYYY')

                            currentData.forEach((cd) => {
                                const value = dayjs(get(cd, dt.keyName, ''), 'DD/MM/YYYY')

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
                                const dates: string[] = (filtersFuncData[dt.customFunc!](get(cd, dt.keyName, '')) ?? []).filter(d => d !== undefined && d !== '')

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
                                const dates: string[] = (filtersFuncData[dt.customFunc!](get(cd, dt.keyName, '')) ?? []).filter(d => d !== undefined && d !== '')

                                if (dates.length <= 0) return

                                console.log(dates)

                                var fimDate = dates[dates.length - 1]
                                var fimValue = dayjs(fimDate, 'DD/MM/YYYY')

                                if (fimValue.isSame(dayjs(dt.value as string, 'DD/MM/YYYY'))) {
                                    filteredData.push(cd)
                                }
                            })
                            break
                        case 'tem a data':
                            currentData.forEach((cd) => {
                                const dates: string[] = (filtersFuncData[dt.customFunc!](get(cd, dt.keyName, '')) ?? []).filter(d => d !== undefined && d !== '')

                                if (dates.includes(dt.value)) {
                                    filteredData.push(cd)
                                }
                            })
                            break
                        case 'entre':
                            const dateA = dt.value ? dayjs(dt.value as string, 'DD/MM/YYYY') : dayjs('01/01/2000', 'DD/MM/YYYY')
                            const dateB = dt.value2 ? dayjs(dt.value2 as string, 'DD/MM/YYYY') : dayjs('31/12/2030', 'DD/MM/YYYY')

                            currentData.forEach((cd) => {
                                const dates: string[] = (filtersFuncData[dt.customFunc!](get(cd, dt.keyName, '')) ?? []).filter(d => d !== undefined && d !== '')

                                let isBetween = false

                                dates.forEach((dtStr) => {
                                    if (isBetween) return

                                    const dt = dayjs(dtStr, 'DD/MM/YYYY')

                                    if (!dt.isValid()) return

                                    if ((dt.isAfter(dateA) || dt.isSame(dateA)) && (dt.isBefore(dateB) || dt.isSame(dateB))) {
                                        isBetween = true
                                    }
                                })

                                if (isBetween) {
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
    setPagCount(getCount(currentData, itemsCount))
    setCurrentPage(0)
    setListPage(1)
    localStorage.setItem(localTableName, JSON.stringify(filterData))
    setListClone(currentData)
}

interface OrdenarDadosProps {
    order: OrderBy
    list: any[]
    orderAsc: boolean
}

export function ordenarDados({ order, list, orderAsc = false }: OrdenarDadosProps) {
    const sortedList = cloneDeep(list).sort((a, b) => {
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
    return sortedList
}


export async function downloadCSVFile(list: any[], config: CsvConfigProp, filters: FilterValue[]) {
    if (list.length <= 0) return
    
    let data:any[] = []

    if (config.downloadAll && config.customAll) data = config.customAll(list, filters)
    else if (!config.downloadAll && config.customFiltered) data = config.customFiltered(list, filters)
    else {
            // definindo os campos especificados do csv
            list.forEach(x => {
                const obj = {}
            
                config.map.forEach(m => {
                    // opção de usar o valor do filtro no próprio campo
                    if (m.useFilterValue && !config.downloadAll && !m.onlyAll) {
                        const filterValueList = filters.filter(f => f.label == m.useFilterValue.label && m.useFilterValue.operators.includes(f.operator))  
                        const filterValue = filterValueList.length > 0 ? (filterValueList.reduce(r => r.value).value || undefined) : undefined
            
                        obj[m.name] = filterValue || get(x, m.key)
                        return
                    }
            
                    if (m.onlyFilter) return
            
                    obj[m.name] = get(x, m.key)
                })
            
                data.push(obj)
            })
    }

    const worksheet = XLSX.utils.json_to_sheet(data)
    const workbook = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(workbook, worksheet, config.fileName)

    XLSX.writeFile(workbook, `${config.fileName}.xlsx`)
}

export function downloadCSVAll(e: React.MouseEvent, list: any[], keys: string[], fileName: string) {
    e.preventDefault()

    if (list.length <= 0) return

    const header = keys.join(',') + '\n'
    const values = list
        .map((x) =>
            keys
                .map((k) => {
                    if (k === 'tbRa') return x[k]['NO_CIDADE']
                    if (k === 'rlEventoData') return `${x[k][0]['DT_INICIO']} - ${x[k][0]['HR_INICIO']}`
                    if (typeof x[k] === 'string') return `"${x[k]}"`
                    if (typeof x[k] === 'object' && x[k] !== null) return `"${transformArrayObjectInString(x[k]).slice(1, -1)}"`
                    return x[k]
                })
                .join(',')
        )
        .join('\n')

    const csvData = header + values
    const link = document.createElement('a')
    link.href = 'data:text/csv;charset=utf-8,%EF%BB%BF' + encodeURI(csvData)
    link.download = `${fileName}.csv`
    link.click()
}
