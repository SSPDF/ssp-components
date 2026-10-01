import { Meta, StoryObj } from '@storybook/nextjs'
import { MenuItem } from '@mui/material'
import TabNavBar from '../components/navbar/TabNavBar'
import { SspComponentsProvider } from '../components/providers/SspComponentsProvider'

/**
 * Navbar com abas. `next={false}` desliga o `useRouter`/`next/image` para a story
 * rodar fora de uma aplicação Next — nesse modo a aba ativa vem da prop `route`.
 *
 * O breakpoint de colapso muda conforme a quantidade de links: `md` para até 3
 * links, `lg` acima disso. Estreite a janela para ver a versão mobile.
 */
const meta: Meta<typeof TabNavBar> = {
    title: 'NavBar/TabNavBar',
    component: TabNavBar,
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
type Story = StoryObj<typeof TabNavBar>

const links = [
    { name: 'Início', path: '/' },
    { name: 'Ocorrências', path: '/ocorrencias' },
    { name: 'Relatórios', path: '/relatorios' },
]

export const Base: Story = {
    args: {
        title: 'Sistema de exemplo',
        img: '/logo_70.png',
        next: false,
        pos: 'inherit',
        links,
        route: '/ocorrencias',
        menuItems: <MenuItem>Meu perfil</MenuItem>,
    },
}

/**
 * Acima de 3 links o breakpoint de colapso passa de `md` para `lg`.
 */
export const MuitosLinks: Story = {
    args: {
        ...Base.args,
        links: [...links, { name: 'Unidades', path: '/unidades' }, { name: 'Configurações', path: '/configuracoes' }],
        route: '/unidades',
    },
}

export const CorCustomizada: Story = {
    args: {
        ...Base.args,
        color: '#c2410c',
        customBgColor: '#fff7ed',
    },
}

/**
 * `customBgColor` escuro — o texto usa `theme.palette.getContrastText`, então o
 * contraste é calculado automaticamente.
 */
export const FundoEscuro: Story = {
    args: {
        ...Base.args,
        customBgColor: '#1e293b',
        color: '#38bdf8',
    },
}
