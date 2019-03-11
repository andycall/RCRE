import {ConditionalExpression} from 'estree';
import {execExpression} from '../evaluation';

export function execConditionExpression(exp: ConditionalExpression, context: Object) {
    let test = execExpression(exp.test, context);

    if (test) {
        return execExpression(exp.consequent, context);
    } else {
        return execExpression(exp.alternate, context);
    }
}
