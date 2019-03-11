import {BinaryExpression} from 'estree';
import {execExpression} from '../evaluation';

export function execBinaryExpression(exp: BinaryExpression, context: Object): string | boolean | number | null {
    let left: any = execExpression(exp.left, context);
    let right: any = execExpression(exp.right, context);
    let operator = exp.operator;

    if (context) {
        if (context.hasOwnProperty(left) && exp.left.type === 'Identifier') {
            left = context[left];
        }

        if (context.hasOwnProperty(right) && exp.right.type === 'Identifier') {
            right = context[right];
        }
    }

    switch (operator) {
        case '+':
            return left + right;
        case '-':
            return left - right;
        case '*':
            return left * right;
        case '**':
            return left ** right;
        case '/':
            return left / right;
        case '^':
            return left ^ right;
        case '&':
            return left & right;
        case 'in':
            return left in right;
        case 'instanceof':
            return left instanceof right;
        case '%':
            return left % right;
        case '>>':
            return left >> right;
        case '>>>':
            return left >>> right;
        case '<<':
            return left << right;
        case '>':
            return left > right;
        case '>=':
            return left >= right;
        case '<':
            return left < right;
        case '<=':
            return left <= right;
        case '|':
            return left | right;
        case '==':
            /* tslint:disable */
            return left == right;
            /* tslint:enable */
        case '===':
            return left === right;
        case '!=':
            /* tslint:disable */
            return left != right;
            /* tslint:enable */
        case '!==':
            return left !== right;
        default:
            return null;
    }
}
