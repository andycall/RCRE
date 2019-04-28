import {CustomerParams} from '../index';
import {containerActionCreators} from '../../Container/action';
import {compileExpressionString, isExpression, parseExpressionString} from '../../util/vm';

export interface PassCustomerExecConfig {
    /**
     * 目标container组件的key
     */
    model: string;

    /**
     * 写入的值
     */
    assign: Object | string;
}

export function passCustomer(config: PassCustomerExecConfig, params: CustomerParams) {
    let targetContainerModel = config.model;
    let assign = config.assign;
    let {
        runTime
    } = params;
    let output;

    if (isExpression(targetContainerModel)) {
        targetContainerModel = parseExpressionString(targetContainerModel, runTime);
    }

    if (isExpression(assign)) {
        output = parseExpressionString(assign, runTime);
    } else {
        output = compileExpressionString(assign, runTime);
    }

    if (!output) {
        throw new Error('pass output is not valid, please check your ExpressionString');
    }

    params.rcreContext.store.dispatch(containerActionCreators.dataCustomerPass({
        model: targetContainerModel,
        data: output
    }, {
        rcre: params.rcreContext,
        container: params.containerContext,
        iterator: params.iteratorContext
    }));

    return true;
}
