const path = require('path');
const typescript = require('rollup-plugin-typescript2');
const postcss = require('rollup-plugin-postcss');

const workspace = path.join(__dirname, '../../packages');

module.exports = {
    input: path.join(workspace, 'rcre/src/index.tsx'),
    output: {
        file: path.join(workspace, 'rcre/dist/index.js'),
        format: 'cjs'
    },
    plugins: [
        typescript({
            tsconfig: path.join(workspace, 'rcre/tsconfig-build.json'),
            clean: true
        }),
        postcss({
            extract: true
        })
    ],
    external: [
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
        'querystring'
    ]
};