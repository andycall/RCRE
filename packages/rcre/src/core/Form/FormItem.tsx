import * as React from 'react';
import {RootState} from '../../data/reducers';
import {
    BasicProps, ElementsInfo,
    FormContextType,
    FormItemContextType, FormItemState,
    RunTimeType
} from '../../types';
import {FormItemContext, ContainerContext, FormContext} from '../context';
import {request} from '../Service/api';
import {getRuntimeContext, isPromise, recycleRunTime} from '../util/util';
import {applyRule} from './validate';
import {isPlainObject, isNil, isEqual} from 'lodash';
import {ApiRule, ValidateRules} from './types';
import {compileExpressionString, isExpression, parseExpressionString} from '../util/vm';

export interface FormItemProps {
    required?: boolean;
    rules?: ValidateRules[];

    /**
     * 使用接口进行自动验证
     */
    apiRule?: ApiRule;
    filterRule?: any;
    isTextFormItem?: boolean;
    filterErrMsg?: any;
    validation?: (value: any) => {isValid: boolean, errmsg?: string};
    control?: any;
}

export type RCREFormItemProps = FormItemProps & BasicProps;

export class RCREFormItem extends React.PureComponent<RCREFormItemProps, {
    validating: boolean;
}> {
    static contextType = FormContext as any;
    context: FormContextType;
    private isUnMounted?: boolean;
    public readonly controlElements: {
        [name: string]: ElementsInfo;
    };

    static getComponentParseOptions() {
        return {
            blackList: ['filterRule', 'filterErrMsg', 'validation']
        };
    }

    constructor(props: RCREFormItemProps) {
        super(props);

        this.state = {
            validating: false
        };
        this.isUnMounted = false;
        this.controlElements = {};
    }

    componentWillUnmount(): void {
        this.isUnMounted = true;
    }

    private initControlElements = (name: string, info: ElementsInfo) => {
        if (this.controlElements.hasOwnProperty(name)) {
            this.updateControlElements(name, info);
            return;
        }

        this.controlElements[name] = info;
    }

    private updateControlElements = (name: string, info: ElementsInfo) => {
        let exist = this.controlElements[name];

        this.controlElements[name] = {
            ...exist,
            ...info
        };
    }

    private deleteControlElements = (name: string) => {
        delete this.controlElements[name];
    }

    private initFormItem = () => {
        let required = this.props.required;

        if (this.props.rules && !this.props.required) {
            required = this.props.rules.some(rule => {
                let v = !!rule.required;
                return v;
            });
        }

        let names = Object.keys(this.controlElements);

        for (let name of names) {
            this.context.$registerFormItem(name, this);

            this.context.$setFormItem({
                formItemName: name,
                rules: this.props.rules,
                status: 'success',
                errorMsg: '',
                required: required || false,
                valid: true
            });
        }
    }

    componentDidMount() {
        this.initFormItem();
    }

    componentDidUpdate(prevProps: Readonly<RCREFormItemProps>, prevState: Readonly<{}>, snapshot?: any): void {
        let prevRunTime = getRuntimeContext(prevProps.containerContext, prevProps.rcreContext, {
            formContext: prevProps.formContext,
            iteratorContext: prevProps.iteratorContext,
        });
        let nextRunTime = getRuntimeContext(this.props.containerContext, this.props.rcreContext, {
            formContext: this.props.formContext,
            iteratorContext: this.props.iteratorContext
        });

        let prevRules = compileExpressionString(prevProps.rules || [], prevRunTime, [], true);
        let nextRules = compileExpressionString(this.props.rules || [], nextRunTime, [], true);

        let isRequiredChanged = prevProps.required !== this.props.required;
        let isRuleChanged = !isEqual(prevRules, nextRules);
        let isFilterRuleChanged = false;

        let controlledNames = Object.keys(this.controlElements);

        for (let name of controlledNames) {
            let prevValue = prevProps.containerContext.$getData(name);
            let nextValue = this.props.containerContext.$getData(name);

            if (prevProps.filterRule && this.props.filterRule) {
                let prevValidateResult = this.validFilterRule(prevProps.filterRule, prevValue, prevRunTime, prevProps.filterErrMsg);
                let nextValidateResult = this.validFilterRule(this.props.filterRule, nextValue, nextRunTime, this.props.filterErrMsg);

                if (!isEqual(prevValidateResult, nextValidateResult)) {
                    isFilterRuleChanged = true;
                    break;
                }
            }

            if (prevProps.validation && this.props.validation) {
                let oldStatus = this.runValidation(prevProps.validation, prevValue, prevRunTime);
                let nextStatus = this.runValidation(this.props.validation, nextValue, nextRunTime);

                if (!isEqual(oldStatus, nextStatus)) {
                    isFilterRuleChanged = true;
                    break;
                }
            }
        }

        if (isRequiredChanged || isRuleChanged || isFilterRuleChanged) {
            let names = Object.keys(this.controlElements);
            for (let name of names) {
                let element = this.controlElements[name];

                if (element.disabled) {
                    continue;
                }

                let value = this.props.containerContext.$getData(name);
                this.validateFormItem(name, value);
            }
        }
    }

    private apiRuleExport = async (exportConf: string | object, runTime: RunTimeType) => {
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

        if (isPlainObject(exportValue)) {
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

            this.props.containerContext.$setMultiData(items);
        } else if (exportValue) {
            console.warn('apiRule的export属性，需要返回一个普通对象作为返回值');
        }

        return;
    }

    private apiValidate = async (apiRule: ApiRule, formItemName: string, value: any): Promise<boolean> => {
        if (this.state.validating) {
            return true;
        }

        let runTime = getRuntimeContext(this.props.containerContext, this.props.rcreContext, {
            formContext: this.props.formContext,
            iteratorContext: this.props.iteratorContext
        });

        let data;
        let execRunTime = {
            ...runTime,
            $args: {
                value: value,
                name: formItemName
            }
        };

        let url = apiRule.url;
        if (isExpression(apiRule.url)) {
            url = parseExpressionString(url, execRunTime);
        }

        if (!url) {
            console.error('至少提供一个请求的地址');
            return false;
        }

        if (!apiRule.validate || !isExpression(apiRule.validate)) {
            console.error('请提供验证所需的ExpressionString');
            return false;
        }

        if (isExpression(apiRule.data)) {
            data = parseExpressionString(apiRule.data, execRunTime);
        } else {
            data = compileExpressionString(apiRule.data, execRunTime);
        }

        this.props.rcreContext.dataProviderEvent.addToList(url);

        this.setState({
            validating: true
        });

        let ret = await request(url, {
            url: url,
            method: apiRule.method,
            data: data,
            formSubmit: apiRule.formSubmit
        }, runTime.$global.proxy);

        this.setState({
            validating: false
        });

        // 如果这个时候直接unmount，会有异常
        if (this.isUnMounted) {
            this.props.rcreContext.dataProviderEvent.clear();
            return false;
        }

        if (this.props.containerContext.model) {
            let state: RootState = this.props.rcreContext.store.getState();
            // 重新更新runTime
            execRunTime.$data = state.$rcre.container[this.props.containerContext.model];
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

        this.props.rcreContext.dataProviderEvent.setToDone(url);

        if (isValid) {
            this.context.$setFormItem({
                formItemName: formItemName,
                valid: true,
                errorMsg: '',
                rules: this.props.rules,
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

            this.context.$setFormItem({
                formItemName: formItemName,
                valid: false,
                rules: this.props.rules,
                errorMsg: errmsg || '',
                status: 'error'
            });
            return false;
        }

        recycleRunTime(execRunTime);
        recycleRunTime(runTime);

        return true;
    }

    private validFilterRule = (filterRule: string, data: any, runTime: RunTimeType, filterErrMsg: string = '') => {
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

    private runValidation = (validation: any, data: any, runTime: RunTimeType): {isValid: boolean, errmsg: string} => {
        let stats = parseExpressionString(validation, {
            ...runTime,
            $args: {
                value: data
            }
        });

        if (!stats) {
            console.error('RCREFormItem: your validation function did return an object with inValid property');
            return {
                isValid: false,
                errmsg: 'validation exec failed'
            };
        }

        if (typeof stats === 'object' && !stats.hasOwnProperty('isValid')) {
            console.error('RCREFormItem: validation should return an object with inValid property');
            return {
                isValid: false,
                errmsg: ''
            };
        }

        return stats;
    }

    public validateFormItem = async (
        formItemName: string,
        data: any,
        options: {apiRule: boolean} = {apiRule: true}
    ): Promise<boolean> => {
        let rules = this.props.rules || [];
        let required = this.props.required;
        let filterRule = this.props.filterRule;
        let apiRule = this.props.apiRule;
        let isValid = true;
        let errmsg = '';

        let runTime = getRuntimeContext(this.props.containerContext, this.props.rcreContext, {
            formContext: this.props.formContext,
            iteratorContext: this.props.iteratorContext
        });

        rules = compileExpressionString(rules, runTime, [], true);

        if (required) {
            rules = rules.concat([{
                required: true
            }]);
        }

        if (this.props.isTextFormItem) {
            this.context.$setFormItem({
                formItemName: formItemName,
                valid: true,
                status: 'success',
                errorMsg: '',
                rules: this.props.rules
            });
            return true;
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
            let ret = this.validFilterRule(filterRule!, data, runTime, this.props.filterErrMsg);
            isValid = ret.isValid;
            errmsg = ret.errmsg;
        }

        if (isValid && isExpression(this.props.validation)) {
            let ret = this.runValidation(this.props.validation, data, runTime);
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

            if (condition && options.apiRule) {
                try {
                    return await this.apiValidate(apiRule, formItemName, data);
                } catch (err) {
                    let apiFailedMsg = apiRule!.errmsg || err.message;

                    if (isExpression(apiFailedMsg)) {
                        apiFailedMsg = parseExpressionString(apiFailedMsg, {
                            ...runTime,
                            $output: err.message
                        });
                    }

                    this.context.$setFormItem({
                        formItemName: formItemName,
                        valid: false,
                        rules: this.props.rules,
                        status: 'error',
                        required: required,
                        errorMsg: apiFailedMsg || '验证接口调用失败'
                    });

                    this.setState({
                        validating: false
                    });
                    return false;
                }
            }
        }

        this.context.$setFormItem({
            formItemName: formItemName,
            valid: isValid,
            status: isValid ? 'success' : 'error',
            errorMsg: isValid ? '' : errmsg,
            required: required,
            rules: this.props.rules,
        });

        recycleRunTime(runTime);

        return isValid;
    }

    private handleChange = (name: string, data: any) => {
        // 输入值改变，需要重置API请求锁
        this.setState({
            validating: false
        }, () => {
            this.props.containerContext.$setData(name, data);
            this.validateFormItem(name, data);
        });
    }

    private handleDelete = (name: string) => {
        this.deleteControlElements(name);
        this.context.$deleteFormItem(name);
        this.props.containerContext.$deleteData(name);
    }

    private getFormItemControl = (formItemName: string): FormItemState => {
        if (!this.context.$form) {
            return { valid: false, formItemName: '-' };
        }

        return this.context.$form.control[formItemName];
    }

    private handleBlur = () => {
        // 针对某些含有多个name属性的组件，可以考虑在组件初始化的时候，往formItem组件注册多个name值
        let names = Object.keys(this.controlElements);

        for (let name of names) {
            let element = this.controlElements[name];

            if (element.disabled) {
                continue;
            }

            this.validateFormItem(name, this.props.containerContext.$getData(name));
        }
        this.forceUpdate();
    }

    private getFormItemValidInfo = (): { valid: boolean, errmsg: string } => {
        let names = Object.keys(this.controlElements);
        let errmsg = '';
        let isValid = names.every(name => {
            let formItemInfo = this.getFormItemControl(name);
            if (!formItemInfo) {
                return false;
            }

            let valid = formItemInfo.valid;

            if (!valid) {
                errmsg = formItemInfo.errorMsg || '';
                return false;
            }

            return true;
        });

        return {
            valid: isValid,
            errmsg: errmsg
        };
    }

    render() {
        let formItemStatus = this.getFormItemValidInfo();

        let context: FormItemContextType = {
            $handleBlur: this.handleBlur,
            $validateFormItem: this.validateFormItem,
            initControlElements: this.initControlElements,
            updateControlElements: this.updateControlElements,
            $deleteFormItem: this.context.$deleteFormItem,
            $setFormItem: this.context.$setFormItem,
            deleteControlElements: this.deleteControlElements,
            $formItem: {
                valid: formItemStatus.valid,
                errmsg: formItemStatus.errmsg,
                validating: this.state.validating
            },
            isUnderFormItem: true
        };

        let containerContext = {
            ...this.props.containerContext,
            $setData: this.handleChange,
            $deleteData: this.handleDelete
        };

        return (
            <FormItemContext.Provider value={context}>
                <ContainerContext.Provider value={containerContext}>
                    {this.props.children}
                </ContainerContext.Provider>
            </FormItemContext.Provider>
        );
    }
}