import {ObjectExpression} from 'estree';
import {execExpression} from '../evaluation';

export function execObjectExpression(exp: ObjectExpression, context: Object) {
    let properties = exp.properties;
    let newObject = {};

    for (let prop of properties) {
        if (prop.value.type === 'ObjectPattern'
            || prop.value.type === 'ArrayPattern'
            || prop.value.type === 'RestElement'
            || prop.value.type === 'AssignmentPattern') {
            throw new Error('ES6 Pattern syntax is not supported');
        }

        let key = execExpression(prop.key, context);
        let value = execExpression(prop.value, context);

        if (context && key in context) {
            key = context[key];
        }

        if (context && value in context) {
            value = context[value];
        }

        if (key === null || key === undefined || typeof key === 'boolean' || key instanceof RegExp) {
            continue;
        }
        newObject[key] = value;
    }

    return newObject;
}
