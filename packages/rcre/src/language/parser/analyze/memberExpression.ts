// import {isNil} from 'lodash';
// import {Expression, Identifier, MemberExpression, Super} from 'estree';
// import {generate} from 'escodegen';
//
// function getIndentifierAndLiteralValue(exp: Expression | Super) {
//     if (exp.type === 'Identifier') {
//         return '.' + exp.name;
//     }
//
//     if (exp.type === 'Literal') {
//         let value = exp.value;
//         if (value instanceof RegExp || typeof value === 'boolean' || isNil(value)) {
//             return;
//         }
//
//         if (typeof value === 'number') {
//             value = '[' + value + ']';
//         }
//
//         return value;
//     }
//
//     return null;
// }
//
// type IdentifierItem = {
//     type: 'property' | 'object';
//     name: string;
//     position: string;
//     node: any;
//     objectCode?: string;
// };
//
// function findIdentifier(exp: MemberExpression, identifier: IdentifierItem[], position: string) {
//     let object = exp.object;
//     let property = exp.property;
//
//     if (object.type === 'Identifier') {
//         identifier.push({
//             type: 'object',
//             name: object.name,
//             position: position + '.object',
//             node: object
//         });
//     }
//
//     if (property.type === 'Identifier' || property.type === 'Literal') {
//         let objectCode = generate(exp.object);
//         let propertyName = getIndentifierAndLiteralValue(property);
//         if (propertyName) {
//             identifier.push({
//                 type: 'property',
//                 name: propertyName,
//                 objectCode: objectCode,
//                 position: position + '.property',
//                 node: property
//             });
//         }
//     }
//
//     object['parent'] = exp;
//     property['parent'] = exp;
//
//     if (object.type === 'MemberExpression') {
//         findIdentifier(object, identifier, position + '.object');
//     }
//
//     if (property.type === 'MemberExpression') {
//         findIdentifier(property, identifier, position + '.property');
//     }
// }
//
// function getIdentifierProps(identifier: IdentifierItem[], rootNode: MemberExpression) {
//     return identifier.map(identi => {
//         // let position = identi.position;
//         // console.log(identi.objectCode);
//
//         // let propStr = '';
//         // let node: Identifier = identi.node;
//         // while (node && node['parent'] !== rootNode) {
//         //     let parent: MemberExpression = node['parent'];
//         //
//         //     if (parent.property === node) {
//         //         break;
//         //     }
//         //
//         //     let propertyValue = getIndentifierAndLiteralValue(parent.property);
//         //
//         //     if (propertyValue) {
//         //         propStr += propertyValue;
//         //     }
//         //
//         //     node = node['parent'];
//         // }
//         //
//         // if (propStr[0] === '.') {
//         //     propStr = propStr.substr(1);
//         // }
//         //
//         // return {
//         //     name: identi.name,
//         //     prop: propStr
//         // };
//     });
// }
//
// export function memberExpressionWalker(exp: MemberExpression) {
//     let identifier: IdentifierItem[] = [];
//     findIdentifier(exp, identifier, 'root');
//
//     console.log(identifier);
//
//     // getIdentifierProps(identifier, exp);
//
//     // console.log(identifier);
//     // let props = getIdentifierProps(identifier, exp);
//     // console.log(props);
//
//     // let object = exp.object;
//     // let property = exp.property;
//     //
//     // let objectInfo = {};
//     // let propertyInfo = {};
//     //
//     // if (object.type === 'MemberExpression') {
//     //     objectInfo = memberExpressionWalker(object, depStatus, base);
//     // } else if (property.type === 'MemberExpression') {
//     //     propertyInfo = memberExpressionWalker(property, depStatus, base);
//     // }
//     //
//     // let objectValue = getIndentifierAndLiteralValue(object);
//     // let propertyValue = getIndentifierAndLiteralValue(property);
//
//     // if (!depStatus[base]) {
//     //     depStatus[base] = new Set<string>();
//     // }
//
//     // if (objectValue) {
//     //     if (base === 'unknown') {
//     //         if (!depStatus[objectValue]) {
//     //             depStatus[objectValue] = new Set<string>();
//     //         }
//     //
//     //         // console.log(depStatus);
//     //
//     //         depStatus['unknown'].forEach(i => depStatus[objectValue!].add(i));
//     //         depStatus['unknown'].clear();
//     //     }
//     //
//     //     base = objectValue;
//     // }
//     //
//     // if (propertyValue) {
//     //     depStatus[base].add(propertyValue);
//     // }
//     //
//
//     //     callStack.push(property.name);
//     // }
//     //
//     // if (property.type === 'Literal') {
//     //     let value = property.value;
//     //     if (value instanceof RegExp || typeof value === 'boolean' || isNil(value)) {
//     //         return;
//     //     }
//     //
//     //     if (typeof value === 'number') {
//     //         value = '[' + value + ']';
//     //     }
//     //
//     //     callStack.push(value);
//     // }
// }