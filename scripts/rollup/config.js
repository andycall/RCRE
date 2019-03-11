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
    'axios',
    'qs',
    'prop-types',
    'querystring',
    'url',
    'moment',
    'lru-cache',
    'acorn'
];

const packages = {
    'rcre-runtime': {
        input: path.join(workspace, 'rcre-runtime/src/index.ts'),
        output: {
            file: path.join(workspace, 'rcre-runtime/dist/index.js'),
            format: 'cjs'
        },
        tsconfig: path.join(workspace, 'rcre-runtime/tsconfig-build.json')
    },
    // rcre: {
    //     input: path.join(workspace, 'rcre/src/index.tsx'),
    //     output: {
    //         file: path.join(workspace, 'rcre/dist/index.js'),
    //         format: 'cjs'
    //     },
    //     tsconfig: path.join(workspace, 'rcre/tsconfig-build.json'),
    // }
};

function buildConfig() {
    let output = {};

    Object.keys(packages).forEach(name => {
        output[name] = {
            input: packages[name].input,
            output: packages[name].output,
            plugins: [
                typescript({
                    tsconfig: packages[name].plugins,
                    clean: true
                }),
                postcss({
                    extract: true
                })
            ],
            external: external
        };
    });

    return output;
}

module.exports = buildConfig();