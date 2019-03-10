/**
 * @file 全局定义文件
 * @author dongtiancheng
 */
declare interface Window {
    __REDUX_DEVTOOLS_EXTENSION__: any;
    __REDUX_DEVTOOLS_EXTENSION_COMPOSE__: any;
    RCRE: any;
    RCRE019: any;
    RCRE_React: any;
    RCRE_ReactDOM: any;
    RCRE_VERSION: any;
    React: any;
    ReactDOM: any;
    RCRE_BasicContainer: any;
    RCRE_providerLoader: any;
    RCRE_customerLoader: any;
    RCRE_componentDriver: any;
    RCRE_AXIOS_REQUEST_COOKIE: string;
    RCRE_AXIOS_REQUEST_BASEURI: string;
    /**
     * 请求缓存，根据URL, method缓存接口请求，如果接口在参数相同的情况下，返回一定相同，则可以在测试环境中使用
     */
    __RCRE_TEST_REQUEST_CACHE__: boolean;
    RCRE_filter: any;
    loadRightBar: () => void;
    RCRE_clearStore: any;
}

declare var __VERSION__: any;

interface System {
    import (request: string): Promise<any>;
}
declare var System: System;