import {ArrayExpression} from 'estree';
import {execExpression} from '../evaluation';
import {execSpreadElement} from '../elements/spreadElement';

export function execArrayExpression(exp: ArrayExpression, context: Object) {
    let arr: any[] = [];

    exp.elements.forEach(element => {
        if (element.type === 'SpreadElement') {
            execSpreadElement(element, arr, context);
        } else {
            let value = execExpression(element, context);

            if (context && value in context) {
                value = context[value];
            }

            arr.push(value);
        }
    });

    return arr;
}
