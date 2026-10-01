import { describe, expect, it } from 'vitest'
import { separarPropsDeEstilo } from './propsDeEstilo'

describe('separarPropsDeEstilo', () => {
    it('leva estilos soltos ao sx e deixa as props de DOM no Box', () => {
        const onClick = () => {}
        const { dom, sx } = separarPropsDeEstilo({ border: '1px solid red', borderRadius: 3, id: 'x', className: 'c', 'data-teste': 'd', 'aria-label': 'l', onClick }, { p: 2 })
        expect(dom).toEqual({ id: 'x', className: 'c', 'data-teste': 'd', 'aria-label': 'l', onClick })
        expect(sx).toEqual([{ border: '1px solid red', borderRadius: 3 }, { p: 2 }, undefined])
    })

    it('mantém a precedência do MUI 5: estilos soltos, depois a base, depois o sx do app', () => {
        const { sx } = separarPropsDeEstilo({ borderRadius: 3, sx: [{ color: 'red' }, { m: 1 }] }, { borderRadius: 6 })
        expect(sx).toEqual([{ borderRadius: 3 }, { borderRadius: 6 }, { color: 'red' }, { m: 1 }])
    })

    it('aceita customTableStyle ausente', () => {
        expect(separarPropsDeEstilo(undefined, { p: 2 }).sx).toEqual([{}, { p: 2 }, undefined])
    })
})
