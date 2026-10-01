import type { StorybookConfig } from '@storybook/nextjs'

const config: StorybookConfig = {
    stories: ['../src/**/*.stories.@(js|jsx|mjs|ts|tsx)'],
    // addon-docs precisa estar registrado: sem ele o `tags: ['autodocs']` das stories
    // é inerte (nenhuma página de docs é gerada) e os blocos importados de
    // '@storybook/addon-docs/blocks' quebram em runtime por falta do DocsContext.
    addons: ['@storybook/addon-docs', '@storybook/addon-links'],
    framework: '@storybook/nextjs',
    staticDirs: ['../public'],
}
export default config
