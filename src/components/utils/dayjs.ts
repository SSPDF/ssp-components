import dayjs from 'dayjs'
import customParseFormat from 'dayjs/plugin/customParseFormat'

/**
 * `dayjs` com o plugin `customParseFormat`, o que faz `dayjs('15/03/2024', 'DD/MM/YYYY')`
 * respeitar o formato. Sem ele o formato é ignorado e a data sai inválida.
 *
 * Até o `@mui/x-date-pickers` 6, o `AdapterDayjs` registrava esse plugin no `dayjs` global
 * assim que era importado, e a lib dependia disso sem declarar. A partir da v7 ele só
 * registra quando o adapter é instanciado, isto é, depois que o componente já fez o parse
 * (UPGRADE_PLAN.md 5.17). Todo parse com formato da lib passa por este módulo.
 */
dayjs.extend(customParseFormat)

export default dayjs
