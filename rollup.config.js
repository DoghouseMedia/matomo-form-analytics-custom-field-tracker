const { nodeResolve } = require('@rollup/plugin-node-resolve');
const babel = require('@rollup/plugin-babel');
const terser = require('@rollup/plugin-terser');

const isProduction = process.env.NODE_ENV === 'production';

module.exports = [
    // ESM build
    {
        input: 'src/index.js',
        output: {
            file: 'dist/index.esm.js',
            format: 'esm',
            sourcemap: !isProduction
        },
        plugins: [
            nodeResolve(),
            babel({
                babelHelpers: 'bundled',
                exclude: 'node_modules/**',
                presets: [
                    ['@babel/preset-env', {
                        targets: {
                            browsers: ['> 1%', 'last 2 versions', 'not dead']
                        }
                    }]
                ]
            }),
            ...(isProduction ? [terser()] : [])
        ]
    },
    // CommonJS build
    {
        input: 'src/index.js',
        output: {
            file: 'dist/index.js',
            format: 'cjs',
            exports: 'named',
            sourcemap: !isProduction
        },
        plugins: [
            nodeResolve(),
            babel({
                babelHelpers: 'bundled',
                exclude: 'node_modules/**',
                presets: [
                    ['@babel/preset-env', {
                        targets: {
                            browsers: ['> 1%', 'last 2 versions', 'not dead']
                        }
                    }]
                ]
            }),
            ...(isProduction ? [terser()] : [])
        ]
    },
    // UMD build for browser
    {
        input: 'src/index.js',
        output: {
            file: 'dist/index.umd.js',
            format: 'umd',
            name: 'MatomoFormAnalyticsCustomFieldTracker',
            sourcemap: !isProduction,
            globals: {
                'matomo': 'Matomo'
            }
        },
        external: ['matomo'],
        plugins: [
            nodeResolve(),
            babel({
                babelHelpers: 'bundled',
                exclude: 'node_modules/**',
                presets: [
                    ['@babel/preset-env', {
                        targets: {
                            browsers: ['> 1%', 'last 2 versions', 'not dead']
                        }
                    }]
                ]
            }),
            ...(isProduction ? [terser()] : [])
        ]
    }
];