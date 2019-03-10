import {CustomerParams} from '../index';
import {compileExpressionString, isExpression, parseExpressionString} from '../../util/vm';
import {request} from '../../../services/api';
import * as _ from 'lodash';
import {store} from '../../../index';
import {actionCreators} from '../../Container/action';
import {AxiosResponse} from 'axios';
import {runTimeType} from '../../Container';

export interface SubmitCustomerExecConfig {
    /**
     * 提交的地址
     */
    url: string;

    /**
     * 提交的方式
     */
    method: string;

    /**
     * 提交的数据
     */
    data: Object | string;

    /**
     * 返回值验证
     */
    retCheckPattern?: string;

    /**
     * 返回值映射
     */
    retMapping?: Object;

    /**
     * 提示的错误信息
     */
    retErrorMsg?: string;
    retErrMsg?: string;

    /**
     * 使用application/x-www-form-urlencoded格式进行提交
     */
    formSubmit?: boolean;

    /**
     * 将提交的值写入到当前的数据模型
     */
    export?: Object;

    /**
     * 返回值映射的字段
     */
    namespace?: string;
}

function handleError(error: Error, response: AxiosResponse, config: SubmitCustomerExecConfig, runTime: runTimeType) {
    let data = {};

    // axios response data
    if (response && response.data) {
        data = response.data;
    }

    let errmsg = config.retErrorMsg || config.retErrMsg;
    if (errmsg && isExpression(errmsg)) {
        errmsg = parseExpressionString(errmsg, {
            ...runTime,
            $output: data
        });
    }

    errmsg = errmsg || error.message;

    throw new Error(errmsg);
}

export async function submitCustomer(config: SubmitCustomerExecConfig, params: CustomerParams) {
    if (!config.url) {
        console.error('URL is Required for submit request');
        return;
    }

    if (!config.method) {
        config.method = 'GET';
    }

    let {
        runTime
    } = params;

    config = compileExpressionString(config, runTime, ['retCheckPattern', 'retErrorMsg', 'retErrMsg']);

    let data = config.data;

    if (_.isPlainObject(data)) {
        config.data = compileExpressionString(data, runTime);
    } else if (isExpression(data)) {
        config.data = parseExpressionString(data, runTime);
    }

    let proxyUrl = null;

    if (runTime.$global) {
        proxyUrl = runTime.$global.proxy;
    }

    console.log(params.options);
    // 在某些特殊场景(E2E TEST)下，不提交，直接返回待提交的数据
    if (params.options && params.options.preventSubmit) {
        return config;
    }

    let ret;
    try {
        ret = await request(config.url, config, proxyUrl);
    } catch (e) {
        let errResponse = e.response;

        handleError(e, errResponse, config, runTime);
        return;
    }

    if (ret.status !== 200) {
        throw new Error('Request Failed' + ret.statusText);
    }

    if (config.retCheckPattern) {
        let isValid = parseExpressionString(config.retCheckPattern, {
            ...runTime,
            $output: ret.data
        });

        if (!isValid) {
            handleError(new Error(), ret, config, runTime);
            return;
        }
    }

    let innerRunTime = {
        ...runTime,
        $output: ret.data
    };

    if (_.isPlainObject(config.retMapping)) {
        ret.data = compileExpressionString(config.retMapping, innerRunTime)!;
    }

    if (config.export) {
        let exportValue = compileExpressionString(config.export, innerRunTime);
        let keys = Object.keys(exportValue);
        let multiItems = keys.map(key => ({
            name: key,
            value: exportValue[key]
        }));

        store.dispatch(actionCreators.setMultiData(multiItems, params.model, params.context));
    }

    return ret.data;
}