import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import FormProvider from '../../providers/FormProvider'
import GenericFormProvider from '../../providers/GenericFormProvider'
import DatePicker from './DatePicker'
import GenericDatePicker from './GenericDatePicker'
import TimePicker from './TimePicker'

/**
 * Os três pickers registram a validação (obrigatório, data mínima/máxima) dentro do
 * `inputRef` do picker do MUI — uma ref de callback, que o React chama com o `<input>`.
 * Até a 0.3.0 o callback retornava um `<TextField>` que nunca renderizava; o que valia
 * era o `register` avaliado nas props dele. A Etapa 4 tirou o JSX (UPGRADE_PLAN.md 5.16)
 * e este teste garante que o `register` continua acontecendo: sem ele, o campo
 * obrigatório vazio passaria no submit.
 */

async function submeterVazio(ui: (onSubmit: () => void) => React.ReactElement) {
    const onSubmit = vi.fn()
    render(ui(onSubmit))
    await userEvent.click(screen.getByText('enviar'))
    return onSubmit
}

describe('validação dos pickers registrada pelo inputRef', () => {
    it('DatePicker obrigatório vazio bloqueia o submit do FormProvider', async () => {
        const onSubmit = await submeterVazio((fn) => (
            <FormProvider onSubmit={fn}>
                <DatePicker name='data' title='Data' required />
                <button type='submit'>enviar</button>
            </FormProvider>
        ))
        await waitFor(() => expect(screen.getByText('Este campo é obrigatório')).toBeInTheDocument())
        expect(onSubmit).not.toHaveBeenCalled()
    })

    it('TimePicker obrigatório vazio bloqueia o submit do FormProvider', async () => {
        const onSubmit = await submeterVazio((fn) => (
            <FormProvider onSubmit={fn}>
                <TimePicker name='hora' title='Hora' required />
                <button type='submit'>enviar</button>
            </FormProvider>
        ))
        await waitFor(() => expect(screen.getByText('Este campo é obrigatório')).toBeInTheDocument())
        expect(onSubmit).not.toHaveBeenCalled()
    })

    it('GenericDatePicker obrigatório vazio bloqueia o submit do GenericFormProvider', async () => {
        const onSubmit = await submeterVazio((fn) => (
            <GenericFormProvider onSubmit={fn}>
                <GenericDatePicker name='data' title='Data' required />
                <button type='submit'>enviar</button>
            </GenericFormProvider>
        ))
        await waitFor(() => expect(screen.getByText('Este campo é obrigatório')).toBeInTheDocument())
        expect(onSubmit).not.toHaveBeenCalled()
    })
})
