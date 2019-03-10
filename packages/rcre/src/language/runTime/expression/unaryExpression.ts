import {UnaryExpression} from 'estree';
import {execExpression} from '../evaluation';

export function execUnaryExpression(exp: UnaryExpression, context: Object) {
    let operator = exp.operator;
    let argument = exp.argument;

    let ret = execExpression(argument, context);

    if (context && ret in context) {
        ret = context[ret];
    }

    switch (operator) {
        case '-':
            return -ret;
        case '+':
            return +ret;
        case '!':
            return !ret;
        case '~':
            return ~ret;
        case 'typeof':
            return typeof ret;
        default:
            throw new TypeError('UnaryExpression: ' + operator + ' operator is not supported');
    }
}
