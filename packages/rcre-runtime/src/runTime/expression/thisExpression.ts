import {ThisExpression} from 'estree';

export function execThisExpression(exp: ThisExpression, context: Object) {
    return context;
}
