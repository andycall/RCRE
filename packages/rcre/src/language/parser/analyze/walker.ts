// import {Expression} from 'estree';
// import {memberExpressionWalker} from './memberExpression';
//
// export function walker(exp: Expression, dependencies: string[], base: string) {
//     switch (exp.type) {
//         case 'MemberExpression': {
//             memberExpressionWalker(exp);
//             break;
//         }
//         // case 'Literal':
//         // case 'Identifier':
//         // case 'BinaryExpression':
//         // case 'ConditionalExpression':
//         // case 'ObjectExpression':
//         // case 'ThisExpression':
//         // case 'ArrayExpression':
//         // case 'UnaryExpression':
//         // case 'UpdateExpression':
//         // case 'LogicalExpression':
//         // case 'CallExpression':
//         // case 'NewExpression':
//         //
//         case 'AssignmentExpression':
//         case 'TemplateLiteral':
//         case 'ClassExpression':
//         case 'MetaProperty':
//         case 'TaggedTemplateExpression':
//         case 'AwaitExpression':
//         case 'FunctionExpression':
//         case 'ArrowFunctionExpression':
//         case 'YieldExpression':
//         case 'SequenceExpression':
//         default:
//             return;
//     }
// }