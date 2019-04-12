import axios, {AxiosRequestConfig, AxiosResponse} from 'axios';
import * as _ from 'lodash';
import {stringify} from 'qs';
import {Chalk} from 'chalk';
const httpAdaptors = require('axios/lib/adapters/http');

interface RequestCache {
    [method: string]: {
        [url: string]: AxiosResponse;
    };
}

let requestCache: RequestCache = {
    get: {},
    post: {},
    put: {},
    head: {}
};

if (process.env.NODE_ENV === 'test') {
    axios.defaults.adapter = httpAdaptors;
}

export async function request(url: string, config: AxiosRequestConfig & {
    // 使用application/x-www-form-urlencoded的方式进行提交
    formSubmit?: boolean;
}, proxy?: string): Promise<AxiosResponse> {
    config = _.cloneDeep(config);

    if (proxy) {
        let proxyUrl = config.url || url;

        if (!/https?\:\/\//.test(proxyUrl)) {
            proxyUrl = location.origin + proxyUrl;
        }

        let proxyOptions: AxiosRequestConfig = {
            url: proxy!,
            method: config.method,
            data: {
                url: proxyUrl,
                method: config.method,
                data: config.data
            }
        };

        url = proxy;
        config = proxyOptions;
    }

    if (!config.method || /^get$/i.test(config.method)) {
        config.params = config.data;
        config.method = 'GET';
    }

    if (config.formSubmit && /post/i.test(config.method)) {
        // 避免stringify过滤undefined
        if (typeof config.data === 'object') {
            _.each(config.data, (value, key) => {
                if (value === undefined || value === null) {
                    config.data[key] = '';
                }
            });
        }
        config.data = stringify(config.data);
    }

    // 为测试框架访问接口提供支持
    if (window && window.RCRE_AXIOS_REQUEST_COOKIE) {
        if (!config.headers) {
            config.headers = {};
        }
        config.headers.cookie = window.RCRE_AXIOS_REQUEST_COOKIE;
    }

    if (window && window.RCRE_AXIOS_REQUEST_BASEURI) {
        config.url = window.RCRE_AXIOS_REQUEST_BASEURI + config.url;
    }

    let method = config.method.toLowerCase();

    let cachedUrl = url + '?' + stringify(config.data);

    if (process.env.NODE_ENV === 'test') {
        let chalk: Chalk = require('chalk');
        // const util = require('util');
        let logger = chalk.bold(chalk.blue('Request Logger'));
        let u = chalk.green(`${url}`);
        let m = chalk.yellow(`${config.method}`);
        let cached = !!requestCache[method][cachedUrl];
        let c = cached ? chalk.green(`${cached}`) : chalk.red(`${cached}`);
        // let response = chalk.cyan(util.inspect(ret.data, false));
        let msg = `${logger}: [url]: ${u}; [method]: ${m}; [data]: ${JSON.stringify(config.data)}; [cached]: ${c};`;
        console.log(msg);
    }

    let ret: any;
    if (window && window.__RCRE_TEST_REQUEST_CACHE__ && requestCache[method][cachedUrl]) {
        ret = await new Promise((resolve) => {
            resolve(requestCache[method][cachedUrl]);
        });
    } else {
        ret = await axios(url, config);
        if (process.env.NODE_ENV === 'test') {
            requestCache[method][cachedUrl] = ret;
        }
    }

    return ret;
}
