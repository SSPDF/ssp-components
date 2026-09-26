import axios from 'axios'
import { Meta, StoryObj } from '@storybook/nextjs'
import FormBaseDecorator from '../decorators/FormBaseDecorator'
import DropFileUpload from '../components/form/file/DropFileUpload'
import { expect, waitFor, within } from 'storybook/test'
import { dadosEnviados, enviar, selecionarArquivos } from './interacao'

const meta: Meta<typeof DropFileUpload> = {
    title: 'File/DropFileUpload',
    component: DropFileUpload,
    tags: ['autodocs'],
    decorators: [FormBaseDecorator],
}

export default meta
type Story = StoryObj<typeof DropFileUpload>

export const Base: Story = {
    args: {
        name: 'teste',
        title: 'Upload de arquivo (Drop)',
    },
}

/**
 * Envio pelo seletor do react-dropzone: o componente faz POST com axios e mostra o progresso.
 * A API é simulada no `beforeEach`, com um adapter do axios que devolve 201 e o `coSeqArquivo`.
 * Arquivo acima do limite (4 MB) é recusado com mensagem.
 */
export const Interacao: Story = {
    tags: ['interacao'],
    args: { ...Base.args, apiURL: '/api-simulada/arquivos', tipoArquivo: '7' },
    beforeEach: () => {
        const original = axios.defaults.adapter
        axios.defaults.adapter = async (config) => {
            config.onUploadProgress?.({ loaded: 100, total: 100, bytes: 100, lengthComputable: true })
            return { data: [{ coSeqArquivo: 456 }], status: 201, statusText: 'Created', headers: {}, config }
        }
        return () => {
            axios.defaults.adapter = original
        }
    },
    play: async ({ canvasElement }) => {
        const canvas = within(canvasElement)
        const input = canvasElement.querySelector<HTMLInputElement>('input[type=file]')!

        const grande = new File([new Uint8Array(5 * 1024 * 1024)], 'grande.pdf', { type: 'application/pdf' })
        await selecionarArquivos(input, grande)
        await expect(await canvas.findByText(/tamanho inferior a 4 MB/)).toBeVisible()

        await selecionarArquivos(input, new File(['%PDF-1.4'], 'laudo.pdf', { type: 'application/pdf' }))
        await expect(await canvas.findByText('laudo.pdf')).toBeVisible()
        await expect(canvas.getByText('Você selecionou 1 arquivo.')).toBeVisible()
        await enviar(canvasElement)
        await dadosEnviados(canvasElement)
        await waitFor(async () => expect(JSON.parse(canvas.getByTestId('arquivos-enviados').textContent!)).toEqual([{ CO_SEQ_ARQUIVO: 456, CO_TIPO_ARQUIVO: 7 }]))
    },
}
