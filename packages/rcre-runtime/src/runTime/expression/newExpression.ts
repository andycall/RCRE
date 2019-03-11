import {NewExpression} from 'estree';
import {execExpression} from '../evaluation';
import {execSpreadElement} from '../elements/spreadElement';

export function execNewExpression(exp: NewExpression, context: Object) {
    let callee = exp.callee;

    if (callee.type !== 'Identifier') {
        throw new TypeError('declaring function in expression string is not supported');
    }

    callee = execExpression(callee, context);

    let args = exp.arguments;
    let retArgs: any[] = [];

    args.forEach(arg => {
        if (arg.type === 'SpreadElement') {
            execSpreadElement(arg, retArgs, context);
        } else {
            let value = execExpression(arg, context);

            if (context && value in context) {
                value = context[value];
            }

            retArgs.push(value);
        }
    });

    if (typeof callee !== 'string') {
        throw new TypeError('invalid callee function of filters');
    }

    if (context && !(callee in context)) {
        throw new TypeError('ReferenceError: ' + callee + ' is not defined');
    }

    let f = context[callee];

    if (typeof f !== 'function') {
        throw new TypeError('TypeError: ' + callee + ' is not a function');
    }
    // @ts-ignore
    return new f(...retArgs);
}
