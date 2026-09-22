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

/**
 * `btProps` é repassado para o `Bt` interno.
 *
 * **Lacuna de tipagem conhecida:** `CustomMenu` declara `btProps?: ButtonProps`,
 * mas o `Bt` aceita `ButtonProps & { customColor, customFontColor }`. Em runtime
 * `customColor` funciona; o TS recusa. Por isso esta story usa só props de
 * `ButtonProps`. Ver seção 5.8 do UPGRADE_PLAN.md.
 */
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

export const Vazio: Story = {
    args: {
        children: 'Sem opções',
        data: [],
    },
}
