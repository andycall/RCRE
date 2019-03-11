const rollup = require('rollup');
const config = require('./config');

let modules = Object.keys(config);

async function main() {
    for (let key of modules) {
        await rollup.rollup(config[key]);
    }
}

main();