import {ProviderSourceConfig, runTimeType} from '../../../types';
import {AsyncAdaptor, AsyncAdaptorRetValue} from '../adaptors/async';
import {AxiosRequestConfig, AxiosResponse} from 'axios';
import {isNil, clone} from 'lodash';
import {request} from '../../Service/api';
import {isExpression, parseExpressionString} from '../../util/vm';

type AjaxConfig = AxiosRequestConfig & {
    keepEmptyData?: boolean;
};

export class AjaxAdaptor extends AsyncAdaptor {
    async exec(provider: ProviderSourceConfig, runTime: runTimeType): Promise<AsyncAdaptorRetValue> {
        let config: AjaxConfig = provider.config;
        if (!config.url) {
            throw new Error('AjaxAdaptor: url is required param for ajax call');
        }

        if (!config.keepEmptyData) {
            config.data = clone(config.data);
            for (let key in config.data) {
                if (isNil(config.data[key]) || config.data[key] === '') {
                    delete config.data[key];
                }
            }
        }

        try {
            let response: AxiosResponse = await request(config.url!, config);
            return {
                success: true,
                errmsg: '',
                data: response.data
            };
        } catch (e) {
            let errResponse = e.response;
            let $output;
            // axios response data
            if (errResponse && errResponse.data) {
                $output = errResponse.data;
            }

            let errmsg = provider.retErrMsg || e.message;

            if (isExpression(errmsg)) {
                errmsg = parseExpressionString(errmsg, {
                    ...runTime,
                    $output: $output
                });
            }

            return {
                success: false,
                errmsg: errmsg,
                data: null
            };
        }
    }
}