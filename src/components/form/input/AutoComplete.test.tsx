import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { AuthContext } from '../../../context/auth'
import FormProvider from '../../providers/FormProvider'
import AutoComplete from './AutoComplete'

/**
 * O `AutoComplete` usava `useQuery` do react-query v3, o que exigia um
 * `QueryClientProvider` montado pelo app (UPGRADE_PLAN.md 5.2). Estes testes rodam
 * **sem** provider de query nenhum.
 */

const opcoes = [
    { id: 1, label: 'Asa Norte' },
    { id: 2, label: 'Asa Sul' },
]

function responder(corpo: unknown) {
    const fetchMock = vi.fn((_url: string, _init?: RequestInit) => Promise.resolve(new Response(JSON.stringify(corpo))))
    vi.stubGlobal('fetch', fetchMock)
    return fetchMock
}

function montar(props: { url: string; dataPath?: string }, token = 'tk-123') {
    return render(
        <AuthContext.Provider value={{ user: { token } } as any}>
            <FormProvider onSubmit={() => {}}>
                <AutoComplete name='bairro' title='Bairro' {...props} />
            </FormProvider>
        </AuthContext.Provider>,
    )
}

describe('AutoComplete', () => {
    afterEach(() => vi.unstubAllGlobals())

    it('busca as opções ao montar, com o token do usuário, e as mostra ao abrir', async () => {
        const fetchMock = responder(opcoes)
        montar({ url: 'https://api.invalid/bairros' })

        await waitFor(() => expect(fetchMock).toHaveBeenCalledTimes(1))
        expect(fetchMock.mock.calls[0][0]).toBe('https://api.invalid/bairros')
        expect(fetchMock.mock.calls[0][1]?.headers).toEqual({ Authorization: 'Bearer tk-123' })

        await userEvent.click(screen.getByRole('combobox'))
        expect(await screen.findByText('Asa Norte')).toBeInTheDocument()
        expect(screen.getByText('Asa Sul')).toBeInTheDocument()
    })

    it('extrai a lista pelo dataPath quando a resposta é um objeto', async () => {
        responder({ dados: { itens: opcoes } })
        montar({ url: 'https://api.invalid/bairros', dataPath: 'dados.itens' })

        await userEvent.click(screen.getByRole('combobox'))
        expect(await screen.findByText('Asa Sul')).toBeInTheDocument()
    })

    it('dataPath que não existe resulta em lista vazia, sem quebrar', async () => {
        responder({ outra: [] })
        montar({ url: 'https://api.invalid/bairros', dataPath: 'dados.itens' })

        await userEvent.click(screen.getByRole('combobox'))
        expect(await screen.findByText('No options')).toBeInTheDocument()
    })

    it('erro de rede não quebra o componente', async () => {
        const erro = vi.spyOn(console, 'error').mockImplementation(() => {})
        vi.stubGlobal(
            'fetch',
            vi.fn(() => Promise.reject(new TypeError('Failed to fetch'))),
        )
        montar({ url: 'https://api.invalid/bairros' })

        await waitFor(() => expect(erro).toHaveBeenCalled())
        expect(screen.getByRole('combobox')).toBeInTheDocument()
        erro.mockRestore()
    })

    it('cancela a requisição ao desmontar', async () => {
        const fetchMock = responder(opcoes)
        const { unmount } = montar({ url: 'https://api.invalid/bairros' })
        const signal = fetchMock.mock.calls[0][1]?.signal as AbortSignal
        unmount()
        expect(signal.aborted).toBe(true)
    })
})
