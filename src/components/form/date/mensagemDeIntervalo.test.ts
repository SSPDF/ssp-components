import { describe, expect, it } from 'vitest'
import { mensagemDeIntervalo } from './mensagemDeIntervalo'

describe('mensagemDeIntervalo (UPGRADE_PLAN.md 5.21e)', () => {
    it('com os dois limites, cita os dois', () => {
        expect(mensagemDeIntervalo('01/01/2020', '31/12/2030')).toBe('A data tem que estar entre 01/01/2020 e 31/12/2030')
    })
    it('só com o mínimo, não cita o máximo', () => {
        expect(mensagemDeIntervalo('16/04/2023')).toBe('A data tem que ser a partir de 16/04/2023')
    })
    it('só com o máximo, não cita o mínimo', () => {
        expect(mensagemDeIntervalo(undefined, '31/12/2030')).toBe('A data tem que ser até 31/12/2030')
    })
})
