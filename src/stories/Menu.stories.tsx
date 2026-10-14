import { Meta, StoryObj } from '@storybook/nextjs'
import Menu from '../components/utils/CustomMenu'
import { SspComponentsProvider } from '../components/providers/SspComponentsProvider'

const meta: Meta<typeof Menu> = {
    title: 'Utils/Menu',
    component: Menu,
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
type Story = StoryObj<typeof Menu>

export const Base: Story = {
    args: {
        children: 'Ações',
        data: [
            { name: 'Editar', onClick: () => console.log('Editar') },
            { name: 'Duplicar', onClick: () => console.log('Duplicar') },
            { name: 'Arquivar', onClick: () => console.log('Arquivar') },
        ],
    },
}

/** `btProps` é repassado para o `Bt` interno: aceita as props do `Button` do MUI. */
export const ComPropsDeBotao: Story = {
    args: {
        children: 'Exportar',
        btProps: { variant: 'contained', size: 'medium' },
        data: [
            { name: 'Exportar CSV', onClick: () => console.log('csv') },
            { name: 'Exportar XLSX', onClick: () => console.log('xlsx') },
        ],
    },
}

/**
 * …e também as cores próprias do `Bt` (`customColor`/`customFontColor`). Até a 0.1.x
 * o tipo de `btProps` era só `ButtonProps` e o TS recusava estas props, embora
 * funcionassem em runtime (UPGRADE_PLAN.md 5.8c).
 */
export const ComCorCustomizada: Story = {
    args: {
        children: 'Ações',
        btProps: { customColor: '#1b5e20', customFontColor: '#ffffff' },
        data: [
            { name: 'Aprovar', onClick: () => console.log('aprovar') },
            { name: 'Reprovar', onClick: () => console.log('reprovar') },
        ],
    },
}

export const Vazio: Story = {
    args: {
        children: 'Sem opções',
        data: [],
    },
}
