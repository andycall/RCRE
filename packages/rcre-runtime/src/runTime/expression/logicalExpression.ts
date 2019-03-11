import {LogicalExpression} from 'estree';
import {execExpression} from '../evaluation';

export function execLogicalExpression(exp: LogicalExpression, context: Object) {
    let operator = exp.operator;
    let left = execExpression(exp.left, context);

    switch (operator) {
        case '||':
            if (!!left) {
                return left;
            } else {
                return execExpression(exp.right, context);
            }
        case '&&':
            if (!left) {
                return false;
            } else {
                let right = execExpression(exp.right, context);
                return !!right ? right : false;
            }
        default:
            break;
    }
}
