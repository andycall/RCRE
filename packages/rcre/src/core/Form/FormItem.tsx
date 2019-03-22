import * as React from 'react';
import {createChild, dataProviderEvent, isPromise, request, RunTimeType, store} from "../../index";
import {applyRule} from './validate';
import {isPlainObject, isEqual, isNil, isEmpty, each, get, find} from 'lodash';
import {BasicContainer, BasicContainerPropsInterface, recycleRunTime} from "../Container";
import {ApiRule, FormItemConfig} from "./types";
import {SET_FORM_ITEM_PAYLOAD} from "./actions";
import {FormItemState, FormState} from "./Form";
import {compileExpressionString, isExpression, parseExpressionString} from "../util/vm";

export class FormItemPropsInterface extends BasicContainerPropsInterface<FormItemConfig<any>> {
    info: FormItemConfig<any>;

    $form: FormState;

    formItemFunctions: {
        /**
         * 更新表单元素的属性
         */
        $setFormItem: (payload: Partial<SET_FORM_ITEM_PAYLOAD>) => void;

        /**
         * 删除表单元素的验证信息
         */
        $deleteFormItem: (formItemName: string) => void;
    }
}

export function formItemConnect(): (Wrapper: React.ComponentClass<any>) => React.ComponentClass<any> {
    return (Wrapper) => {
        return class RCREFormItem extends BasicContainer<FormItemConfig<any>, FormItemPropsInterface, {}> {
            static displayName = 'RCREFormItemConnect(' + Wrapper.name + ')';
            public TEST_UPDATECOUNT: number;
            private infoBlackList: string[];
            private isApiValidate: boolean;
            private collectNameBlackList: string[];
            public $propertyWatch: string[];
            private nameIsExpression: boolean = false;
            private isTooMuchProperty: boolean = false;
            constructor(props: FormItemPropsInterface) {
                super(props);

                this.handleChange = this.handleChange.bind(this);
                this.handleDelete = this.handleDelete.bind(this);
                this.handleBlur = this.handleBlur.bind(this);
                this.eventHandle = this.eventHandle.bind(this);
                this.validateFormItem = this.validateFormItem.bind(this);
                this.apiValidate = this.apiValidate.bind(this);
                this.infoBlackList = ['filterRule', 'filterErrMsg'];
                // TODO 暂时在formItem里写死跳过的name黑名单配置，后续修改
                this.collectNameBlackList = ['dataSource'];
                this.isApiValidate = false;
                this.$propertyWatch = [];
                this.TEST_UPDATECOUNT = 0;
                this.findWatchProperty(props.info, '', ['apiRule']);

                if (this.$propertyWatch.length > 10) {
                    this.isTooMuchProperty = true;
                }
            }

            public findWatchProperty(info: any, path: string, blackList: string[] = [], depth: number = 0) {
                each(info, (value, name) => {
                    if (name === 'trigger') {
                        return;
                    }

                    if (blackList.indexOf(name) >= 0) {
                        return;
                    }

                    if (depth > 5) {
                        this.isTooMuchProperty = true;
                        return;
                    }

                    let key = path;
                    key += '.' + name;

                    if (isExpression(value)) {
                        this.$propertyWatch.push(key.substr(1));
                    }

                    if (Array.isArray(value) && value.length > 0) {
                        value.forEach((v, i) => this.findWatchProperty(v, key + '[' + i + ']', blackList, depth + 1));
                    }

                    if (isPlainObject(value)) {
                        this.findWatchProperty(value, key, blackList, depth + 1);
                    }
                });
            }

            private isPropertyChanged(nextProps: any) {
                // 当没有监听的Key，强制刷新
                if (this.$propertyWatch.length === 0) {
                    return true;
                }
                let nextRunTime = this.getRuntimeContext(nextProps);
                let prevRunTime = this.getRuntimeContext();

                let isChanged = !this.$propertyWatch.every(key => {
                    let nextValue = parseExpressionString(get(nextProps.info, key), nextRunTime);
                    let prevValue = parseExpressionString(get(this.props.info, key), prevRunTime);
                    return nextValue === prevValue;
                });

                recycleRunTime(prevRunTime);
                recycleRunTime(nextRunTime);

                return isChanged;
            }

            private isNameListChanged(nextProps: FormItemPropsInterface, prevNameList: string[], nextNameList: string[]) {
                // 判断control中包含的name是否改变的函数
                return nextNameList.some((name: string, index: number) => {
                    if (this.isNameChanged(nextProps, prevNameList[index], nextNameList[index])) {
                        return true;
                    } else {
                        return false;
                    }
                });
            }

            private isNameChanged(nextProps: FormItemPropsInterface, prevName?: string, nextName?: string) {
                // 判断单一name是否改变的函数
                if (!prevName && !nextName) {
                    return false;
                }

                if (!nextName) {
                    return true;
                }

                if (isExpression(name)) {
                    let prevRunTime = this.getRuntimeContext();
                    let nextRunTime = this.getRuntimeContext(nextProps);
                    prevName = parseExpressionString(name, prevRunTime);
                    nextName = parseExpressionString(name, nextRunTime);
                    recycleRunTime(prevRunTime);
                    recycleRunTime(nextRunTime);
                }

                if (prevName !== nextName) {
                    return true;
                }

                let prevValue = this.getValueFromDataStore(prevName);
                let nextValue = this.getValueFromDataStore(nextName, nextProps);

                return prevValue !== nextValue;
            }

            private isValidChanged(nextProps: FormItemPropsInterface, prevNameList: string[], nextNameList: string[]) {
                let prevControl = this.props.$form && this.props.$form.control;
                let nextControl = nextProps.$form && nextProps.$form.control;
                return nextNameList.some((name: string, index: number) => {
                    let thisValid = find(prevControl, {'formItemName': prevNameList[index]});
                    let nextValid = find(nextControl, {'formItemName': nextNameList[index]});
                    if (isEqual(thisValid, nextValid)) {
                        return false;
                    } else {
                        return true;
                    }
                });
            }

            private getFormItemInfo(props: FormItemPropsInterface) {
                let info = this.getPropsInfo(props.info, props, this.infoBlackList);
                let runTime = this.getRuntimeContext(props);
                info.control = compileExpressionString(info.control, runTime, [], false, ['name']);
                recycleRunTime(runTime);
                return info;
            }

            private collectRawComponentNameFromChild(control: any[] | any, props: FormItemPropsInterface = this.props): string[] {
                if (!(control instanceof Array)) {
                    control = [control];
                }
                let nameList: string[] = [];
                let runTime = this.getRuntimeContext(props);
                let me = this;
                function _find(controlList: any[]) {
                    if (me.nameIsExpression) {
                        return;
                    }
                    controlList.forEach(con => {
                        if (con.type === 'container') {
                            return;
                        }

                        if (con.hidden === true || con.show === false) {
                            return;
                        }

                        if (isExpression(con.hidden)) {
                            let hidden = parseExpressionString(con.hidden, runTime);

                            if (hidden === true) {
                                return;
                            }
                        }

                        if (isExpression(con.show)) {
                            let show = parseExpressionString(con.show, runTime);

                            if (show === false) {
                                return;
                            }
                        }

                        let name = con.name;
                        if (isExpression(name)) {
                            me.nameIsExpression = true;
                            return;
                        }

                        if (name && nameList.indexOf(name) < 0) {
                            nameList.push(name);
                        }

                        for (let property in con) {
                            if (con.hasOwnProperty(property) && me.collectNameBlackList.indexOf(property) === -1) {
                                if (con[property] instanceof Array && con[property].length > 0) {
                                    _find(con[property]);
                                }
                                if (isPlainObject(con[property])) {
                                    _find([con[property]]);
                                }
                            }
                        }
                    });
                }

                _find(control);

                recycleRunTime(runTime);

                return nameList;
            }

            private collectCompiledComponentNameFromChild(control: any[] | any, props: FormItemPropsInterface = this.props): {
                nameList: string[],
                disabledMap: Object
            } {
                if (!(control instanceof Array)) {
                    control = [control];
                }

                let nameList: string[] = [];
                let disabledMap = {};
                let runTime = this.getRuntimeContext(props);
                let me = this;
                function _find(controlList: any[]) {
                    controlList.forEach(con => {
                        if (con.type === 'container') {
                            return;
                        }

                        if (con.hidden === true || con.show === false) {
                            return;
                        }

                        if (isExpression(con.hidden)) {
                            let hidden = parseExpressionString(con.hidden, runTime);

                            if (hidden === true) {
                                return;
                            }
                        }

                        if (isExpression(con.show)) {
                            let show = parseExpressionString(con.show, runTime);

                            if (show === false) {
                                return;
                            }
                        }

                        let name = con.name;
                        let disabled = con.disabled;
                        let notFormItem = con.notFormItem;

                        if (name && isExpression(name)) {
                            name = parseExpressionString(name, runTime);
                        }

                        if (isExpression(disabled)) {
                            disabled = parseExpressionString(disabled, runTime);
                        }

                        if (name && nameList.indexOf(name) < 0 && !notFormItem) {
                            disabledMap[name] = disabled;
                            nameList.push(name);
                        }

                        for (let property in con) {
                            if (con.hasOwnProperty(property) && me.collectNameBlackList.indexOf(property) === -1) {
                                if (con[property] instanceof Array && con[property].length > 0) {
                                    _find(con[property]);
                                }
                                if (isPlainObject(con[property])) {
                                    _find([con[property]]);
                                }
                            }
                        }
                    });
                }

                _find(control);

                recycleRunTime(runTime);

                return {
                    nameList,
                    disabledMap
                };
            }

            componentWillUnmount() {
                delete this.$propertyWatch;
                delete this.TEST_UPDATECOUNT;
                super.componentWillUnmount();
            }
            // componentWillUnmount() {
            //     let info = this.getPropsInfo(this.props.info);
            //     let nameList = this.collectCompiledComponentNameFromChild(info.control);
            //
            //     if (this.props.$deleteData && info.name && this.props.$form && !info.disableClearWhenDestroy) {
            //         this.props.$deleteData(info.name);
            //     }
            //     this.isUnMounted = true;
            // }

            componentDidMount() {
                let info = this.getFormItemInfo(this.props);
                let isHidden = info.hidden === true || info.show === false;
                let formItemList = this.collectCompiledComponentNameFromChild(info.control);
                let nameList = formItemList.nameList;
                let disabledMap = formItemList.disabledMap;

                if (nameList.length > 0 && this.props.formItemFunctions.$setFormItem && !isHidden) {
                    nameList.forEach(name => {
                        let formItemName = name;

                        if (disabledMap[formItemName]) {
                            return;
                        }

                        let valid = true;

                        if (info.rules && !info.required) {
                            info.required = info.rules.some(rule => !!rule.required);
                        }

                        if ('required' in info) {
                            valid = !info.required;
                        }

                        if (info.isTextFormItem) {
                            valid = true;
                        }

                        if (!this.props.model) {
                            return;
                        }

                        let state = store.getState();
                        let $data = state.container[this.props.model];
                        let formData = get($data, name);

                        let formDataEmpty = false;
                        if (typeof formData === 'object') {
                            formDataEmpty = isEmpty(formData);
                        } else {
                            formDataEmpty = isNil(formData);
                        }

                        if (!formDataEmpty || (typeof info.filterRule === 'string' && isExpression(info.filterRule))) {
                            this.validateFormItem(info, name, formData);
                        } else {
                            this.props.formItemFunctions.$setFormItem({
                                formItemName: formItemName,
                                rules: info.rules,
                                required: info.required,
                                valid: valid
                            });
                        }
                    });
                }
            }

            componentWillReceiveProps(nextProps: FormItemPropsInterface) {
                let prevInfo = this.getFormItemInfo(this.props);
                let nextInfo = this.getFormItemInfo(nextProps);
                let prevFormItemList = this.collectCompiledComponentNameFromChild(prevInfo.control);
                let nextFormItemList = this.collectCompiledComponentNameFromChild(nextInfo.control, nextProps);
                let prevNameList = prevFormItemList.nameList;
                let nextNameList = nextFormItemList.nameList;
                let isNameSame = isEqual(prevNameList, nextNameList);
                let prevDisabledMap = prevFormItemList.disabledMap;
                let nextDisabledMap = nextFormItemList.disabledMap;
                let nextRunTime = this.getRuntimeContext(nextProps);
                let prevRunTime = this.getRuntimeContext();

                let isFilterRuleChange = false;
                if (prevInfo.filterRule && nextInfo.filterRule) {
                    let oldFilterRule = this.validFilterRule(prevInfo.filterRule, null, prevRunTime, prevInfo.filterErrMsg);
                    let nextFilterRule = this.validFilterRule(nextInfo.filterRule, null, nextRunTime, nextInfo.filterErrMsg);
                    isFilterRuleChange = oldFilterRule.isValid !== nextFilterRule.isValid;
                }

                if (nextProps.$data && nextNameList.length > 0) {
                    nextNameList.forEach(name => {
                        let nextValue = this.getValueFromDataStore(name, nextProps, nextInfo);
                        let prevValue = this.getValueFromDataStore(name, this.props, prevInfo);
                        let nextRules = compileExpressionString(nextInfo.rules, nextRunTime, [], true);
                        let prevRules = compileExpressionString(prevInfo.rules, prevRunTime, [], true);
                        let prevRequired = prevInfo.required;
                        let nextRequired = nextInfo.required;
                        let isNameExist = true;
                        let isSameDisabled =
                            typeof prevDisabledMap[name] !== 'boolean'
                            ||
                            typeof nextDisabledMap[name] !== 'boolean'
                            ||
                            prevDisabledMap[name] === nextDisabledMap[name];
                        let isSameRequired = prevRequired === nextRequired;

                        if (nextDisabledMap[name] === true &&
                            nextProps.$form &&
                            nextProps.$form.control[name] &&
                            !nextProps.$form.control[name].valid
                        ) {
                            this.props.formItemFunctions.$setFormItem({
                                formItemName: name,
                                valid: true,
                                status: 'success',
                                errorMsg: ''
                            });
                            return;
                        }

                        // 如果FormItem在数据模型中不存在也要验证
                        if (isNameSame && nextProps.$form && nextProps.$form.control) {
                            isNameExist = !!nextProps.$form.control[name];
                        }

                        let shouldValidate =
                            // 值不相同，重新验证
                            !isEqual(nextValue, prevValue) ||
                            // 规则不相同，重新验证
                            !isEqual(nextRules, prevRules) ||
                            // name不相同，重新验证
                            !isNameSame ||
                            // name不存在，触发验证
                            !isNameExist ||
                            // disabled不相同，重新验证
                            !isSameDisabled ||
                            // required不相同，重新验证
                            !isSameRequired ||
                            // filterRule计算结果不同，重新验证
                            isFilterRuleChange;

                        if (shouldValidate && (this.isReady(nextProps) || this.isReady())) {
                            this.validateFormItem(nextInfo, name, nextValue, nextRunTime);
                        }

                        // formItem在数据模型中已存在
                        if (nextProps.$form && nextProps.$form.control[name]) {
                            let itemInfo = nextProps.$form.control[name];
                            // 是否强制验证，由triggerSubmit触发
                            let forceValidate = itemInfo.$validate;
                            if (forceValidate) {
                                this.validateFormItem(nextInfo, name, nextValue, nextRunTime);
                                this.props.formItemFunctions.$setFormItem({
                                    formItemName: name,
                                    $validate: false
                                });
                            }
                        }
                    });
                }

                recycleRunTime(prevRunTime);
                recycleRunTime(nextRunTime);
            }

            public shouldComponentUpdate(nextProps: FormItemPropsInterface, nextState: {}) {
                if (this.nameIsExpression || this.isTooMuchProperty) {
                    return true;
                }
                let prevNameList = this.collectRawComponentNameFromChild(this.props.info.control);
                let nextNameList = this.collectRawComponentNameFromChild(nextProps.info.control, nextProps);

                // 判断name中的值是否有变化
                let isNameChanged = this.isNameListChanged(nextProps, prevNameList, nextNameList);
                // 判断$form中的valid是否有变化
                let isValidChange = this.isValidChanged(nextProps, prevNameList, nextNameList);
                // 判断$propertyWatch中的值是否有变化
                let isPropertyChanged = this.isPropertyChanged(nextProps);
                // console.log(nextProps.info.control.name, isValidChange, isNameChanged, isPropertyChanged)
                return isValidChange || isNameChanged || isPropertyChanged;
            }

            private async apiRuleExport(exportConf: string | object, runTime: RunTimeType) {
                let exportValue: object;
                if (isPlainObject(exportConf) && typeof exportConf === 'object') {
                    exportValue = compileExpressionString(exportConf, runTime);
                } else if (isExpression(exportConf)) {
                    let retValue = parseExpressionString(exportConf, runTime);

                    if (isPromise(retValue)) {
                        exportValue = await retValue;
                    } else {
                        exportValue = retValue;
                    }
                } else {
                    return;
                }

                if (isPlainObject(exportValue) && this.props.$setMultiData) {
                    for (let key in exportValue) {
                        if (exportValue.hasOwnProperty(key) && isPromise(exportValue[key])) {
                            exportValue[key] = await exportValue[key];
                        }
                    }

                    let keys = Object.keys(exportValue);
                    let items = keys.map(key => ({
                        name: key,
                        value: exportValue[key]
                    }));

                    this.props.$setMultiData(items);
                } else if (exportValue) {
                    console.log(exportValue);
                    console.warn('apiRule的export属性，需要返回一个普通对象作为返回值');
                }

                return;
            }

            private async apiValidate(apiRule: ApiRule, formItemName: string, value: any) {
                let runTime = this.getRuntimeContext();
                if (!apiRule.url) {
                    console.error('至少提供一个请求的地址');
                    return;
                }

                if (!apiRule.validate || !isExpression(apiRule.validate)) {
                    console.error('请提供验证所需的ExpressionString');
                    return;
                }

                let data;
                let execRunTime = {
                    ...runTime,
                    $args: {
                        value: value,
                        name: formItemName
                    }
                };

                if (isExpression(apiRule.data)) {
                    data = parseExpressionString(apiRule.data, execRunTime);
                } else {
                    data = compileExpressionString(apiRule.data, execRunTime);
                }

                dataProviderEvent.addToList(apiRule.url);

                let ret = await request(apiRule.url, {
                    url: apiRule.url,
                    method: apiRule.method,
                    data: data,
                    formSubmit: apiRule.formSubmit
                }, runTime.$global.proxy);

                // 如果这个时候直接unmount，会有异常
                if (this.isUnMounted) {
                    dataProviderEvent.clear();
                    return;
                }

                if (this.props.model) {
                    let state = store.getState();
                    // 重新更新润Time
                    execRunTime.$data = state.container[this.props.model!];
                }

                let isValid = parseExpressionString(apiRule.validate, {
                    ...execRunTime,
                    $output: ret.data
                });

                let shouldExport = true;

                if (!isValid) {
                    shouldExport = !apiRule.noExportWhenInvalid;
                }

                if (apiRule.export && shouldExport) {
                    await this.apiRuleExport(apiRule.export, {
                        ...execRunTime,
                        $output: ret.data
                    });
                }

                dataProviderEvent.setToDone(apiRule.url);

                if (isValid) {
                    this.props.formItemFunctions.$setFormItem({
                        formItemName: formItemName,
                        valid: true,
                        status: 'success'
                    });
                } else {
                    let errmsg = apiRule.errmsg;
                    if (errmsg && isExpression(errmsg)) {
                        errmsg = parseExpressionString(errmsg, {
                            ...execRunTime,
                            $output: ret.data
                        });
                    }

                    this.props.formItemFunctions.$setFormItem({
                        formItemName: formItemName,
                        valid: false,
                        errorMsg: errmsg,
                        status: 'error'
                    });
                }

                if (!this.isUnMounted) {
                    this.forceUpdate();
                }
                this.isApiValidate = false;

                recycleRunTime(execRunTime);
                recycleRunTime(runTime);
            }

            private validFilterRule(filterRule: string, data: any, runTime: RunTimeType, filterErrMsg: string = '') {
                let isValid = parseExpressionString(filterRule, {
                    ...runTime,
                    $args: {
                        value: data
                    }
                });
                if (isExpression(filterErrMsg)) {
                    filterErrMsg = parseExpressionString(filterErrMsg, {
                        ...runTime,
                        $args: {
                            value: data
                        }
                    });
                }
                return {
                    isValid: isValid,
                    errmsg: filterErrMsg
                };
            }

            private validateFormItem(
                info: FormItemConfig<any>,
                formItemName: string,
                data: any,
                runTime: RunTimeType = this.getRuntimeContext()
            ) {
                let rules = info.rules || [];
                let required = info.required;
                let filterRule = info.filterRule;
                let apiRule = info.apiRule;
                let isValid = true;
                let errmsg = '';

                rules = compileExpressionString(rules, runTime, [], true);

                if (required) {
                    rules = rules.concat([{
                        required: true
                    }]);
                }

                if (info.isTextFormItem) {
                    this.props.formItemFunctions.$setFormItem({
                        formItemName: formItemName,
                        valid: true,
                        status: 'success',
                        errorMsg: '',
                        required: info.required
                    });
                    return;
                }

                if (rules.length > 0) {
                    let result = {
                        message: '',
                        valid: false
                    };

                    if (!required) {
                        required = rules.some(rule => !!rule.required);
                    }

                    if ((isNil(data) || typeof data === 'string' && data.length === 0) && !required) {
                        isValid = true;
                    } else {
                        isValid = rules.every(rule => {
                            result = applyRule(rule, data);

                            return result.valid;
                        });
                    }

                    if (!isValid) {
                        errmsg = result.message;
                    }
                }

                if (isValid && isExpression(filterRule)) {
                    let ret = this.validFilterRule(filterRule!, data, runTime, info.filterErrMsg);
                    isValid = ret.isValid;
                    errmsg = ret.errmsg;
                }

                if (isValid && apiRule) {
                    let condition = apiRule.condition || true;

                    if (isExpression(condition)) {
                        condition = parseExpressionString(condition, {
                            ...runTime,
                            $args: {
                                value: data,
                                name: formItemName
                            }
                        });
                    }

                    if (!this.isApiValidate && condition) {
                        this.apiValidate(apiRule, formItemName, data).catch(err => {
                            this.isApiValidate = false;
                            let apiFailedMsg = apiRule!.errmsg;

                            if (isExpression(apiFailedMsg)) {
                                apiFailedMsg = parseExpressionString(apiFailedMsg, {
                                    ...runTime,
                                    $output: err.message
                                });
                            }

                            this.props.formItemFunctions.$setFormItem({
                                formItemName: formItemName,
                                valid: false,
                                status: 'error',
                                required: info.required,
                                errorMsg: apiFailedMsg || '验证接口调用失败'
                            });
                        });
                        this.isApiValidate = true;
                        this.props.formItemFunctions.$setFormItem({
                            formItemName: formItemName,
                            valid: true,
                            status: 'validating'
                        });

                        return;
                    }
                }

                if (isValid) {
                    this.props.formItemFunctions.$setFormItem({
                        formItemName: formItemName,
                        valid: true,
                        status: 'success',
                        errorMsg: '',
                        required: info.required
                    });
                } else {
                    this.props.formItemFunctions.$setFormItem({
                        formItemName: formItemName,
                        valid: false,
                        status: 'error',
                        errorMsg: errmsg,
                        required: info.required
                    });
                }

                recycleRunTime(runTime);
            }

            private handleChange(info: FormItemConfig<any>) {
                return (name: string, data: any) => {
                    // 输入值改变，需要重置API请求锁
                    this.isApiValidate = false;

                    this.setData(name, data);
                };
            }

            private handleDelete(name: string) {
                this.props.formItemFunctions.$deleteFormItem(name);

                if (this.props.$deleteData) {
                    this.props.$deleteData(name);
                }
            }

            private getFormItemControl(formItemName: string): FormItemState | null {
                if (this.props.$form && this.props.$form.control) {
                    return this.props.$form.control[formItemName];
                }

                return null;
            }

            private handleBlur(args: Object, options?: any) {
                let info = this.getFormItemInfo(this.props);
                let formItemList = this.collectCompiledComponentNameFromChild(info.control);
                let nameList = formItemList.nameList;
                let disabledMap = formItemList.disabledMap;

                // 针对input组件groups属性的特殊处理，只验证blur所传递上来的name属性
                if (options && options.inputGroupName) {
                    let data = this.getValueFromDataStore(options.inputGroupName);
                    if (!disabledMap[options.inputGroupName]) {
                        this.validateFormItem(info, options.inputGroupName, data);
                    }
                } else if (nameList.length > 0 && !info.apiRule) {
                    nameList.forEach(formItemName => {
                        let data = this.getValueFromDataStore(formItemName);
                        if (!disabledMap[formItemName]) {
                            this.validateFormItem(info, formItemName, data);
                        }
                    });
                    this.forceUpdate();
                }
            }

            private eventHandle(eventName: string, args: Object, options?: any) {
                switch (eventName) {
                    case 'onBlur':
                        console.log('blur');
                        this.handleBlur(args, options);
                        break;
                    default:
                        break;
                }
            }

            componentDidUpdate() {
                // let info = this.getFormItemInfo(this.props);
                // let nameList = this.collectCompiledComponentNameFromChild(info.control);
                //
                // if (this.props.$form && nameList.length > 0) {
                //     nameList.forEach(name => {
                //         let itemState = this.props.$form!.control[name];
                //         if ((info.hidden === true || info.show === false) && itemState) {
                //             this.props.$deleteFormItem(name);
                //         }
                //     });
                // }
            }

            render() {
                if (process.env.NODE_ENV === 'test') {
                    // 单测环境使用
                    this.TEST_UPDATECOUNT++;
                }
                let info = this.getFormItemInfo(this.props);
                if (process.env.NODE_ENV === 'test') {
                    this.TEST_INFO = info;
                }

                if (!this.props.$form) {
                    console.error('FormItem 组件必须在Form组件内部');
                    return <div/>;
                }

                if (!info.control) {
                    return <div>control property is required for FormGroup</div>;
                }

                let control = info.control;
                let formItemChildren;
                let formItemList = this.collectCompiledComponentNameFromChild(control);
                let nameList = formItemList.nameList;
                let validateStatus: any = 'success';
                let validateErrMsg: string | undefined = '';
                // let required = info.required || (info.rules && info.rules.some(rule => !!rule.required));
                let required;
                if (typeof info.required === 'boolean') {
                    required = info.required;
                } else if (!required) {
                    let rules = compileExpressionString(info.rules, this.getRuntimeContext(), [], true);
                    required = (rules && rules.some(rule => !!rule.required));
                }

                // let formControl = this.props.$form.control;
                if (nameList.length > 0) {
                    nameList.every(formItemName => {
                        let itemInfo = this.getFormItemControl(formItemName);

                        if (itemInfo) {
                            validateStatus = itemInfo.status;
                            if (!itemInfo.valid) {
                                validateErrMsg = itemInfo.errorMsg;
                                return false;
                            }
                        }

                        return true;
                    });
                }

                if (control instanceof Array) {
                    formItemChildren = control.map((child, index) => this.renderChildren(child, createChild(child, {
                        ...this.props,
                        info: child,
                        key: `form_item_child_${child.name}`,
                        $setData: this.handleChange(info),
                        $deleteData: this.handleDelete,
                        eventHandle: this.eventHandle
                    })));
                } else {
                    formItemChildren = this.renderChildren(control, createChild(control, {
                        ...this.props,
                        info: control,
                        $setData: this.handleChange(info),
                        $deleteData: this.handleDelete,
                        eventHandle: this.eventHandle
                    }));
                }

                let childElement = (
                    <Wrapper
                        {...info}
                        required={required}
                        validateStatus={validateStatus}
                        validateErrMsg={validateErrMsg}
                    >
                        {formItemChildren}
                    </Wrapper>
                );

                return this.renderChildren(info, childElement);
            }
        }
    }
}
