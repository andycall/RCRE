import {CallExpression} from 'estree';
import {execExpression} from '../evaluation';
import {execSpreadElement} from '../elements/spreadElement';

export function execCallExpression(exp: CallExpression, context: Object) {
    let callee = exp.callee;

    if (callee.type === 'Super') {
        throw new TypeError('super function in expression string is not supported');
    }

    let interpret = execExpression(callee, context);

    let args = exp.arguments;
    let retArgs: any[] = [];

    args.forEach(arg => {
        if (arg.type === 'SpreadElement') {
            execSpreadElement(arg, retArgs, context);
        } else {
            let value = execExpression(arg, context);

            if (arg.type !== 'Literal') {
                if (context && value in context) {
                    value = context[value];
                }
            }

            retArgs.push(value);
        }
    });

    let f;

    if (typeof interpret === 'string') {
        if (context && !(interpret in context)) {
            throw new TypeError('ReferenceError: ' + interpret + ' is not defined');
        }

        f = context[interpret];

        if (typeof f !== 'function') {
            throw new TypeError('TypeError: ' + f + ' is not a functions');
        }
    } else if (interpret.type && interpret.type === '__RCRE_RUNTIME_FUNCTION__') {
        let object = interpret.object;
        let property = interpret.property;

        if (property === 'call') {
            return object.call(retArgs[0], ...retArgs.slice(1));
        }

        if (property === 'apply') {
            return object.apply(retArgs[0], retArgs.slice(1));
        }

        return object[property](...retArgs);
    } else if (typeof callee !== 'function') {
        throw new TypeError('callee is not a function');
    }

    return f.apply(context, retArgs);
}
