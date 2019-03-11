//
// import {UpdateExpression} from 'estree';
// import {execExpression} from '../evaluation';
//
// export function execUpdateExpression(exp: UpdateExpression, context: Object) {
//     let operator = exp.operator;
//     let prefix = exp.prefix;
//     let args = exp.argument;
//
//     let key = execExpression(args, context);
//     let val = null;
//
//     if (context && key in context) {
//         val = context[key];
//     }
//
//     if (prefix) {
//         switch (operator) {
//             case '++':
//                 val++;
//                 context[key]++;
//                 break;
//             case '--':
//                 val--;
//                 context[key]--;
//                 break;
//             default:
//                 break;
//         }
//     } else {
//         switch (operator) {
//             case '++':
//                 context[key]++;
//                 break;
//             case '--':
//                 context[key]--;
//                 break;
//             default:
//                 break;
//         }
//     }
//
//     return val;
// }
