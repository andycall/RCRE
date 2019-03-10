import {SpreadElement} from 'estree';
import {execExpression} from '../evaluation';

export function execSpreadElement(element: SpreadElement, arr: any[], context: Object) {
    let args = element.argument;
    let spread = execExpression(args, context);
    if (!spread[Symbol.iterator]) {
        throw new TypeError(spread + '[Symbol.iterator is not a function]');
    }

    let iterator = spread[Symbol.iterator]();
    let next = iterator.next();

    while (!next.done) {
        arr.push(next.value);
        next = iterator.next();
    }
}
