import type { StorybookConfig } from '@storybook/react-webpack5'
import webpack from 'webpack'

const config: StorybookConfig = {
    stories: ['../src/**/*.mdx', '../src/**/*.stories.@(js|jsx|ts|tsx)'],
    addons: ['@storybook/addon-links', '@storybook/addon-docs'],
    framework: {
        name: '@storybook/react-webpack5',
        options: {},
    },
    staticDirs: ['../public'],

    webpackFinal: async (config) => {
        // Loader para TypeScript
        config.module?.rules?.push({
            test: /\.(ts|tsx)$/,
            exclude: /node_modules/,
            use: [
                {
                    loader: require.resolve('ts-loader'),
                    options: {
                        transpileOnly: true,
                    },
                },
            ],
        })

        config.resolve ??= {}
        config.resolve.fallback = {
            ...(config.resolve.fallback || {}),
            fs: false,
            stream: require.resolve('stream-browserify'),
            zlib: require.resolve('browserify-zlib'),
            buffer: require.resolve('buffer/'),
            util: require.resolve('util/'),
        }

        config.plugins ??= []
        config.plugins.push(
            new webpack.ProvidePlugin({
                Buffer: ['buffer', 'Buffer'],
                process: 'process/browser',
            })
        )

        config.resolve.extensions?.push('.ts', '.tsx')
        return config
    },
}

export default config
