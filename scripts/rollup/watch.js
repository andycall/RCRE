const rollup = require('rollup');
const config = require('./config');
const chalk = require('chalk');

let modules = Object.keys(config);
let queue = modules;


function watch(key) {
    let inputOptions = config[key].inputOptions;
    let outputOptions = config[key].outputOptions;

    const watchOptions = {
        ...inputOptions,
        output: [outputOptions],
        watch: {
            clearScreen: false,
            exclude: 'node_modules/**',
            include: 'packages/**'
        }
    };

    let watcher = rollup.watch(watchOptions);

    watcher.on('event', event => {
        switch(event.code) {
            case 'START':
                console.log(chalk.yellow(key + ' Compiling...'));
                break;
            case 'FATAL':
            case 'ERROR':
                console.log(chalk.red(key + ' Compile Error'));
                console.log(event.error);
                break;
            case 'BUNDLE_END':
                console.log(chalk.green(key + ' Compiled Success'));
                run();
                break;
        }
    });
}

function run() {
    if (queue.length === 0) {
        return;
    }

    let key = modules.shift();
    watch(key);
}

run();
