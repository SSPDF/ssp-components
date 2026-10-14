import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, describe, expect, it, vi } from 'vitest'
import GenericFormProvider from '../../providers/GenericFormProvider'
import GenericInput from './GenericInput'

/**
 * `GenericInput` com tipo mascarado delega para o `GenericMaskInput`. Até a 0.1.x
 * esse componente lia o `FormContext` customizado, que não existe sob o
 * `GenericFormProvider`: cada tecla disparava `Cannot read properties of undefined
 * (reading 'formSetValue')` (UPGRADE_PLAN.md 5.8b). A story só renderiza, não digita
 * — por isso o teste.
 */

function montar(onSubmit: (d: unknown) => void, type: 'cpf' | 'cep' | 'phone') {
    render(
        <GenericFormProvider onSubmit={onSubmit}>
            <GenericInput name='campo' type={type} title='Campo' />
            <button type='submit'>enviar</button>
        </GenericFormProvider>,
    )
    return screen.getByPlaceholderText('Campo')
}

describe('GenericInput mascarado sob GenericFormProvider', () => {
    afterEach(() => vi.restoreAllMocks())

    it.each([
        ['cpf', '12345678901', '123.456.789-01'],
        ['cep', '70070120', '70070-120'],
    ] as const)('digitar %s não lança erro e o valor mascarado chega no submit', async (type, digitado, esperado) => {
        const erros: unknown[] = []
        const onError = (e: ErrorEvent) => erros.push(e.error)
        window.addEventListener('error', onError)
        const onSubmit = vi.fn()

        const input = montar(onSubmit, type)
        await userEvent.type(input, digitado)
        await userEvent.click(screen.getByText('enviar'))

        window.removeEventListener('error', onError)
        expect(erros).toEqual([])
        expect(input).toHaveValue(esperado)
        await waitFor(() => expect(onSubmit).toHaveBeenCalled())
        expect(onSubmit.mock.calls[0][0]).toEqual({ campo: esperado })
    })
})
