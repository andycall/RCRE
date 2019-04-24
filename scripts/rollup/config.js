const path = require('path');
const typescript = require('rollup-plugin-typescript2');
const postcss = require('rollup-plugin-postcss');

const workspace = path.join(__dirname, '../../packages');

const external = [
    'react',
    'react-dom',
    'redux',
    'lodash',
    'events',
    'react-redux',
    'bowser',
    'react-memo-polyfill',
    'react-lifecycles-compat',
    'axios',
    'qs',
    'enzyme',
    'chalk',
    'pretty-format',
    'prop-types',
    'querystring',
    'url',
    'moment',
    'lru-cache',
    'acorn',
    'rcre-runtime',
    'rcre',
    'create-react-context',
    'rcre-test-tools',
    'typescript'
];

const packages = {
    'rcre-runtime': {
        input: path.join(workspace, 'rcre-runtime/src/index.ts'),
        output: {
            file: path.join(workspace, 'rcre-runtime/dist/index.js'),
            format: 'cjs'
        },
        tsconfig: path.join(workspace, './rcre-runtime/tsconfig.json')
    },
    'rcre-runtime-syntax-transform': {
        input: path.join(workspace, 'rcre-runtime-syntax-transform/src/index.ts'),
        output: {
            file: path.join(workspace, 'rcre-runtime-syntax-transform/dist/index.js'),
            format: 'cjs'
        },
        tsconfig: path.join(workspace, './rcre-runtime-syntax-transform/tsconfig.json')
    },
    rcre: {
        input: path.join(workspace, './rcre/src/index.tsx'),
        output: {
            file: path.join(workspace, './rcre/dist/index.js'),
            format: 'cjs'
        },
        tsconfig: path.join(workspace, './rcre/tsconfig.json'),
    },
    'rcre-test-tools': {
        input: path.join(workspace, 'rcre-test-tools/src/index.tsx'),
        output: {
            file: path.join(workspace, 'rcre-test-tools/dist/index.js'),
            format: 'cjs'
        },
        tsconfig: path.join(workspace, 'rcre-test-tools/tsconfig.json')
    }
};

function buildConfig() {
    let output = {};

    Object.keys(packages).forEach(name => {
        output[name] = {
            inputOptions: {
                input: packages[name].input,
                plugins: [
                    typescript({
                        clean: true,
                        tsconfig: packages[name].tsconfig
                    }),
                    postcss({
                        extract: true
                    })
                ],
                external: external
            },
            outputOptions: packages[name].output
        };
    });

    return output;
}

module.exports = buildConfig();