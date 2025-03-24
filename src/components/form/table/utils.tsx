import get from 'lodash.get'
import { FilterValue, OrderBy } from './types'
import dayjs from 'dayjs'
import JSZip from 'jszip'
import cloneDeep from 'lodash.clonedeep'

interface DefineCSVCellsProps {
    csvUpper: boolean
    csvExcludeUpper?: string[]
}

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
                        case 'entre':
                            const dateA = dt.value ? dayjs(dt.value as string, 'DD/MM/YYYY') : dayjs('01/01/2000', 'DD/MM/YYYY')
                            const dateB = dt.value2 ? dayjs(dt.value2 as string, 'DD/MM/YYYY') : dayjs('31/12/2030', 'DD/MM/YYYY')

                            currentData.forEach((cd) => {
                                const dates: string[] = filtersFuncData[dt.customFunc!](get(cd, dt.keyName, '')) ?? []

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

export interface CsvExportOptions {
    list: any[]
    csvUpper?: boolean
    csvExcludeUpper?: string[]
    csvExcludeKeys?: string[]
    csvExcludeKeysCSV?: string[]
    csvExcludeKeysAll?: string[]
    csvCustomKeyNames?: { [key: string]: string }
    csvExcludeValidate?: (key: string, value: any) => boolean
    csv?: { fileName: string }
    multipleDataPath?: string
    normalize?: boolean
    removeQuotes?: boolean
    hideTitleCSV?: boolean
    generateCsvZip?: boolean
    csvZipFileNamesKey?: string
}

export async function downloadCSVFile(e: React.MouseEvent, zip = false, options: CsvExportOptions) {
    e.preventDefault()
    const {
        list,
        csvUpper = false,
        csvExcludeUpper = [],
        csvExcludeKeys = [],
        csvExcludeKeysCSV = [],
        csvCustomKeyNames = {},
        csvExcludeValidate = () => false,
        csv,
        multipleDataPath = '',
        normalize = false,
        removeQuotes = false,
        hideTitleCSV = false,
        generateCsvZip = false,
        csvZipFileNamesKey = '',
    } = options

    if (list.length <= 0) return
    const originalKeys = Object.keys(list[0])

    if (generateCsvZip && zip) {
        const keys = originalKeys.filter((k) => !csvExcludeKeys.includes(k))
        const header = keys.map((k) => csvCustomKeyNames[k] || k).join(',') + '\n'
        const zip = new JSZip()
        const obj: Record<string, any[]> = {}

        list.forEach((item) => {
            const key = item[csvZipFileNamesKey]
            if (!obj[key]) obj[key] = []
            obj[key].push(item)
        })

        for (const [fileName, items] of Object.entries(obj)) {
            const values: string[] = []
            for (const x of items) {
                if (originalKeys.some((k) => csvExcludeValidate(k, x[k]))) continue

                const value = keys.map((k) => formatCell(x[k], k)).join(',')
                values.push(value)
            }
            const csvData = hideTitleCSV ? values.join('\n') : '\uFEFF' + header + values.join('\n')
            if (values.length > 0) {
                zip.file(`${normalizeString(fileName)}.csv`, csvData)
            }
        }

        const link = document.createElement('a')
        const base = await zip.generateAsync({ type: 'base64' })
        link.href = 'data:application/zip;base64,' + base
        link.download = `${csv?.fileName}.zip`
        link.click()
    } else {
        let keys = originalKeys.filter((k) => !csvExcludeKeysCSV.includes(k))
        if (multipleDataPath) keys = ['dtInicio', 'hrInicio', ...keys.map((k) => (k === multipleDataPath ? 'hrTermino' : k))]
        const header = keys.map((k) => csvCustomKeyNames[k] || k).join(',') + '\n'
        const values: string[] = []

        for (const x of list) {
            if (originalKeys.some((k) => csvExcludeValidate(k, x[k]))) continue
            const value = keys.map((k) => formatCell(x[k], k)).join(',')

            if (multipleDataPath && x[multipleDataPath]) {
                for (const d of x[multipleDataPath]) {
                    values.push(value.replace('{dtInicio}', d.dtInicio).replace('{hrInicio}', d.hrInicio).replace('{hrTermino}', d.hrTermino))
                }
            } else {
                values.push(value)
            }
        }

        const csvData = header + values.join('\n')
        const link = document.createElement('a')
        link.href = 'data:text/csv;charset=utf-8,%EF%BB%BF' + encodeURI(csvData)
        link.download = `${csv?.fileName}.csv`
        link.click()
    }

    function formatCell(cell: any, key: string): string {
        let item = typeof cell === 'object' && cell !== null && !Array.isArray(cell) ? transformArrayObjectInString(cell).slice(1, -1) : cell

        if (csvUpper && typeof item === 'string' && !csvExcludeUpper.includes(key)) {
            item = item.toUpperCase()
        }

        if (normalize && typeof item === 'string') {
            item = normalizeString(item)
        }

        if (typeof item === 'string') {
            return removeQuotes ? `${item}` : `"${item}"`
        }

        return item
    }

    function normalizeString(str: string) {
        return str.normalize('NFD').replace(/[̀-ͯ]/g, '')
    }
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
