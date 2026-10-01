import { Meta, StoryObj } from '@storybook/nextjs'
import { Button, Stack, Typography } from '@mui/material'
import { MODAL } from '../components/modal/Modal'
import { SspComponentsProvider } from '../components/providers/SspComponentsProvider'
import { expect, userEvent, waitFor, within } from 'storybook/test'
import { pagina } from './interacao'

/**
 * `MODAL` é um singleton exposto pelo portal que o `SspComponentsProvider` monta.
 * Não é um componente: chame `MODAL.open(<conteudo/>)` de qualquer lugar da árvore.
 *
 * Abaixo de `sm` ele vira um `SwipeableDrawer`; acima, um `Modal` centralizado —
 * redimensione a janela para ver a troca.
 */
const meta: Meta = {
    title: 'Modal/MODAL',
    tags: ['autodocs'],
    decorators: [
        (Story) => (
            <SspComponentsProvider>
                <Story />
            </SspComponentsProvider>
        ),
    ],
}

export default meta
type Story = StoryObj

export const Base: Story = {
    render: () => (
        <Button
            variant='contained'
            onClick={() =>
                MODAL.open(
                    <Stack spacing={1} sx={{ p: 3, bgcolor: 'white', borderRadius: 2 }}>
                        <Typography variant='h6'>Confirmação</Typography>
                        <Typography>Conteúdo aberto via MODAL.open().</Typography>
                    </Stack>,
                )
            }
        >
            Abrir modal
        </Button>
    ),
}

/**
 * `MODAL.reparent(elemento, id)` registra um conteúdo antecipadamente;
 * `MODAL.openReparented(id)` abre o que foi registrado com aquele id.
 */
export const Reparented: Story = {
    render: () => (
        <Stack direction='row' spacing={2}>
            {MODAL.reparent(
                <Stack spacing={1} sx={{ p: 3, bgcolor: 'white', borderRadius: 2 }}>
                    <Typography variant='h6'>Conteúdo reparentado</Typography>
                    <Typography>Registrado com o id &quot;detalhes&quot;.</Typography>
                </Stack>,
                'detalhes',
            )}
            <Button variant='contained' onClick={() => MODAL.openReparented('detalhes')}>
                Abrir reparentado
            </Button>
            <Button variant='outlined' onClick={() => MODAL.close()}>
                Fechar
            </Button>
        </Stack>
    ),
}

/** `MODAL.open()` mostra o conteúdo no portal; Esc fecha. */
export const Interacao: Story = {
    tags: ['interacao'],
    render: Base.render,
    play: async ({ canvasElement }) => {
        await userEvent.click(within(canvasElement).getByRole('button', { name: 'Abrir modal' }))
        const conteudo = await pagina(canvasElement).findByText('Conteúdo aberto via MODAL.open().')
        await expect(conteudo).toBeVisible()

        await userEvent.keyboard('{Escape}')
        await waitFor(() => expect(pagina(canvasElement).queryByText('Conteúdo aberto via MODAL.open().')).toBeNull())
    },
}
