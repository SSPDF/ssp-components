/**
 * Renderiza (SSR) o `DatePicker` da lib com `defaultValue` num processo Node novo e
 * confere que o campo sai preenchido. Roda pelo `scripts/smoke-app.sh`, depois do
 * `next build`, com as versões que o smoke instalou.
 *
 * Existe por causa do UPGRADE_PLAN.md 5.17: com o x-date-pickers 7 e sem o
 * `customParseFormat` registrado pela lib, **só a primeira** montagem de um picker no
 * processo sai vazia — a montagem instancia o `AdapterDayjs`, que registra o plugin, e
 * daí em diante tudo funciona. Por isso não dá para conferir pelo HTML do `next build`
 * (ele renderiza a página mais de uma vez no mesmo processo). No browser cada
 * carregamento de página é um processo novo, então lá o bug aparece sempre.
 */
const React = require('react')
const { renderToString } = require('react-dom/server')
const { FormProvider, DatePicker } = require('@ssplib/react-components')

const html = renderToString(React.createElement(FormProvider, { onSubmit() {} }, React.createElement(DatePicker, { name: 'data', defaultValue: '15/03/2024' })))

if (!html.includes('value="15/03/2024"')) {
    const valores = html.match(/value="[^"]*"/g) || []
    console.error(`DatePicker com defaultValue='15/03/2024' saiu com ${valores.join(' ') || 'nenhum value'} na primeira montagem.`)
    process.exit(1)
}
console.log('ok')
