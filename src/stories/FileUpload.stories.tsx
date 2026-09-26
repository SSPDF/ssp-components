import { Meta, StoryObj } from '@storybook/nextjs'
import FormBaseDecorator from '../decorators/FormBaseDecorator'
import FileUpload from '../components/form/file/FileUpload'
import { expect, waitFor, within } from 'storybook/test'
import { dadosEnviados, enviar, selecionarArquivos } from './interacao'

const meta: Meta<typeof FileUpload> = {
    title: 'File/FileUpload',
    component: FileUpload,
    tags: ['autodocs'],
    decorators: [FormBaseDecorator],
}

export default meta
type Story = StoryObj<typeof FileUpload>

export const Base: Story = {
    args: {
        name: 'teste',
        title: 'Upload de arquivo',
    },
}

/**
 * Envio de um PDF: o componente faz POST na `apiURL` e guarda o `coSeqArquivo` que a API devolve,
 * que chega ao `onSubmit` no segundo argumento. A API é simulada no `beforeEach`; remover o arquivo
 * faz DELETE na mesma url.
 */
export const Interacao: Story = {
    tags: ['interacao'],
    args: { ...Base.args, apiURL: '/api-simulada/arquivos', tipoArquivo: '7' },
    beforeEach: () => {
        const original = window.fetch
        window.fetch = async (url, init) => {
            if (!String(url).startsWith('/api-simulada/arquivos')) return original(url, init)
            if (init?.method === 'DELETE') return Response.json({ status: { status: 200 } })
            return Response.json({ status: { status: 200 }, 0: { coSeqArquivo: 123 } })
        }
        return () => {
            window.fetch = original
        }
    },
    play: async ({ canvasElement }) => {
        const canvas = within(canvasElement)
        const input = canvasElement.querySelector<HTMLInputElement>('input[type=file][accept=".pdf"]')!
        await selecionarArquivos(input, new File(['%PDF-1.4'], 'boletim.pdf', { type: 'application/pdf' }))

        await expect(await canvas.findByText('boletim.pdf')).toBeVisible()
        await expect(canvas.getByText(/Você selecionou 1 arquivo/)).toBeVisible()
        await enviar(canvasElement)
        await dadosEnviados(canvasElement)
        await waitFor(async () => expect(JSON.parse(canvas.getByTestId('arquivos-enviados').textContent!)).toEqual([{ CO_SEQ_ARQUIVO: 123, CO_TIPO_ARQUIVO: 7 }]))
    },
}
