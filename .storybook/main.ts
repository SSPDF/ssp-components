import type { StorybookConfig } from '@storybook/react-webpack5'
const config: StorybookConfig = {
    stories: ['../src/**/*.mdx', '../src/**/*.stories.@(js|jsx|ts|tsx)'],
    addons: ['@storybook/addon-links', '@storybook/addon-essentials', '@storybook/addon-interactions'],
    framework: {
        name: '@storybook/react-webpack5',
        options: {},
    },
    staticDirs: ['../public'],
    docs: {
        autodocs: 'tag',
    },
    webpackFinal: async (storybookConfig) => {
        storybookConfig.resolve = storybookConfig.resolve || {}
        const alias = storybookConfig.resolve.alias || {}

        storybookConfig.resolve.alias = alias

        storybookConfig.resolve.fallback = {
            ...(storybookConfig.resolve.fallback || {}),
            fs: false,
            zlib: false,
            stream: false,
        }

        return storybookConfig
    },
}
export default config
