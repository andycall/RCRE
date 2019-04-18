const rollup = require('rollup');
const config = require('./config');

let modules = Object.keys(config);

async function main() {
    for (let key of modules) {
        let inputOptions = config[key].inputOptions;
        let outputOptions = config[key].outputOptions;

        try {
            // create a bundle
            const bundle = await rollup.rollup(inputOptions);

            // generate code
            await bundle.generate(outputOptions);

            await bundle.write(outputOptions);
        } catch (err) {
            throw err;
        }
    }
}

main().catch(err => {
    console.error(err);
    process.exit(1);
});