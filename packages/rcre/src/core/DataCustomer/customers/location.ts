import {CustomerParams} from '../index';
import {stringify, parse} from 'querystring';
import {compileExpressionString, isExpression, parseExpressionString} from '../../util/vm';
import * as _ from 'lodash';

export interface PassCustomerExecConfig {
    /**
     * 跳转的方式. href 普通地址的跳转， querystring。更新location.search参数
     */
    mode?: 'href' | 'querystring';

    /**
     * 跳转的地址
     */
    href?: string;

    /**
     * 跳转带的参数
     */
    params?: Object | string;
}

export function locationCustomer(config: PassCustomerExecConfig, customParams: CustomerParams) {
    let {
        runTime
    } = customParams;
    let targetHref = config.href;
    let locationParams = config.params;
    let mode = config.mode || 'href';

    if (isExpression(locationParams)) {
        // 当传入的参数是表达式类型
        locationParams = parseExpressionString(locationParams, runTime);
    } else if (_.isPlainObject(locationParams)) {
        // 当传入的参数是Object
        locationParams = compileExpressionString(locationParams, runTime);
    }

    switch (mode) {
        case 'href': {
            // 是跳转方式
            if (!targetHref) {
                console.error('targetHref is necessary fo r location jumping');
            } else if (isExpression(targetHref)) {
                targetHref = parseExpressionString(targetHref, runTime);
            }

            let locationParamsString = '';
            locationParamsString = (targetHref!.indexOf('?') === -1 ? '?' : '&') + stringify(locationParams);
            location.href = targetHref! + locationParamsString;
            return true;
        }
        case 'querystring': {
            //  是更新参数方式
            let curParamsString = location.search.slice(1);
            let currentParams = parse(curParamsString);
            let updatedParamsString = '';

            let updatedParams = Object.assign(currentParams, locationParams);
            updatedParamsString = stringify(updatedParams);

            history.pushState('', '', location.origin + location.pathname + '?' + updatedParamsString);
            return true;
        }
        default:
            throw new Error('location mode is not supported');
    }
}
