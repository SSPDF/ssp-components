import type { Preview } from '@storybook/nextjs'
import { TemaDecorator } from '../src/decorators/TemaDecorator'

const preview: Preview = {
    parameters: {
        // actions: { argTypesRegex: '^on[A-Z].*' },
        controls: {
            matchers: {
                color: /(background|color)$/i,
                date: /Date$/,
            },
        },
    },
    // Tema do app em volta de toda story (ver src/decorators/TemaDecorator.tsx). Os snapshots
    // capturam cada story nos dois: `&globals=tema:escuro` na URL.
    globalTypes: {
        tema: {
            description: 'Tema do app',
            toolbar: {
                title: 'Tema',
                icon: 'mirror',
                items: [
                    { value: 'claro', title: 'Claro' },
                    { value: 'escuro', title: 'Escuro (colorSchemes + variáveis CSS)' },
                ],
                dynamicTitle: true,
            },
        },
    },
    initialGlobals: { tema: 'claro' },
    decorators: [TemaDecorator],
}

export default preview
