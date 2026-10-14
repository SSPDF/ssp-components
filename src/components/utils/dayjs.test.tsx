import { render } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import GenericFormProvider from '../providers/GenericFormProvider'
import GenericDatePicker from '../form/date/GenericDatePicker'
import { filtrarDados } from '../form/table/utils'

/**
 * Os parses com formato da lib (`dayjs('15/03/2024', 'DD/MM/YYYY')`) dependem do plugin
 * `customParseFormat`. Até o `@mui/x-date-pickers` 6 ele vinha de carona no import do
 * `AdapterDayjs`; na v7 só é registrado quando o adapter é instanciado, depois do parse
 * (UPGRADE_PLAN.md 5.17). O arquivo roda num registro de módulos novo (isolamento do vitest),
 * então a ordem importa: o filtro roda antes de qualquer picker montar (a montagem
 * instancia o adapter, que registra o plugin e mascararia o problema), e o picker em seguida
 * é a primeira montagem.
 */
describe('parse de datas com formato', () => {
    // Dia > 12 de propósito: sem o plugin o dayjs cai no `Date` nativo, que lê MM/DD — com
    // dia ≤ 12 os dois lados da comparação erram igual e o teste passaria à toa.
    it('o filtro "data exata" da Table lê DD/MM/YYYY sem nenhum picker montado', () => {
        const setList = vi.fn()
        filtrarDados({
            startData: [
                { id: 1, data: '15/03/2024' },
                { id: 2, data: '16/03/2024' },
            ],
            filterData: [{ keyName: 'data', type: 'date', operator: 'data exata', value: '15/03/2024' } as never],
            filtersFuncData: {},
            localTableName: '',
            setList,
            setListClone: vi.fn(),
            setPagCount: vi.fn(),
            setCurrentPage: vi.fn(),
            setListPage: vi.fn(),
            itemsCount: 10,
        })
        expect(setList).toHaveBeenCalledWith([{ id: 1, data: '15/03/2024' }])
    })

    it('GenericDatePicker mostra o valor padrão já na primeira montagem', () => {
        const { container } = render(
            <GenericFormProvider onSubmit={() => {}}>
                <GenericDatePicker name='data' defaultValue='15/03/2024' persistValue />
            </GenericFormProvider>,
        )
        expect(container.querySelector('input')!.value).toBe('15/03/2024')
    })
})
