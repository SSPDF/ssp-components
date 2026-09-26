/**
 * Helpers das stories de interação (tag `interacao`).
 *
 * Cada story de interação tem uma `play` function que usa o componente como uma pessoa usaria
 * (clica, digita, envia o formulário) e verifica o resultado. Elas rodam em `npm run snapshots`
 * (container e CI), que falha se alguma verificação não passar, e em `npm run interacoes`,
 * contra o Storybook aberto. No Storybook, o painel "Interactions" mostra cada passo.
 *
 * Os decorators de formulário mostram o que o `onSubmit` recebeu em `data-testid='dados-enviados'`.
 */
import { expect, userEvent, waitFor, within } from 'storybook/test'

/** Poppers, menus, listas do Autocomplete e modais vão para o `body`, fora do canvas. */
export const pagina = (canvasElement: HTMLElement) => within(canvasElement.ownerDocument.body)

export async function enviar(canvasElement: HTMLElement) {
    await userEvent.click(within(canvasElement).getByRole('button', { name: /enviar/i }))
}

/** O objeto que o `onSubmit` do formulário recebeu. Falha se o formulário não foi enviado. */
export async function dadosEnviados(canvasElement: HTMLElement): Promise<Record<string, unknown>> {
    const el = await within(canvasElement).findByTestId('dados-enviados')
    return JSON.parse(el.textContent ?? '')
}

/** Confere que o envio foi barrado pela validação: nada chega ao `onSubmit` e a mensagem aparece. */
export async function esperarErroDeValidacao(canvasElement: HTMLElement, mensagem: string | RegExp = /obrigatório/i) {
    const canvas = within(canvasElement)
    await waitFor(() => expect(canvas.getAllByText(mensagem).length).toBeGreaterThan(0))
    expect(canvas.queryByTestId('dados-enviados')).toBeNull()
}

/** Abre um Autocomplete do MUI, escolhe a opção pelo texto e confere que o campo mostra o escolhido. */
export async function escolherNoAutocomplete(canvasElement: HTMLElement, opcao: string, busca?: string) {
    const campo = within(canvasElement).getByRole('combobox')
    await userEvent.click(campo)
    if (busca) await userEvent.type(campo, busca)
    const item = await pagina(canvasElement).findByRole('option', { name: opcao })
    await userEvent.click(item)
    await waitFor(() => expect(campo).toHaveValue(opcao))
}

/** Digita uma data (ou hora) num campo do x-date-pickers, que tem uma seção por parte (dia, mês, ano). */
export async function digitarNoPicker(campo: HTMLElement, digitos: string) {
    await userEvent.click(campo)
    await userEvent.keyboard('{Control>}a{/Control}{Backspace}')
    await userEvent.keyboard(digitos)
}

/** Em que ordem os textos aparecem na página (para conferir ordenação de listas e tabelas). */
export function ordemNaTela(canvasElement: HTMLElement, textos: string[]) {
    const conteudo = canvasElement.textContent ?? ''
    return [...textos].sort((a, b) => conteudo.indexOf(a) - conteudo.indexOf(b))
}

/**
 * Seleciona arquivos num `<input type='file'>` com uma `FileList` real, montada por `DataTransfer`,
 * como o browser faz. O `userEvent.upload` monta uma `FileList` falsa cujo `Object.keys` inclui
 * `length` e `item`, e o `FileUpload` percorre os arquivos com `Object.keys`.
 */
export async function selecionarArquivos(input: HTMLInputElement, ...arquivos: File[]) {
    const dt = new DataTransfer()
    arquivos.forEach((a) => dt.items.add(a))
    input.files = dt.files
    input.dispatchEvent(new Event('change', { bubbles: true }))
}
