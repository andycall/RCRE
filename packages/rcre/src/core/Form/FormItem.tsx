import * as React from 'react';
import {RootState} from '../../data/reducers';
import {
    BasicProps,
    FormContextType,
    FormItemContextType,
    RunTimeType
} from '../../types';
import {FormItemContext, ContainerContext} from '../context';
import {request} from '../Service/api';
import {getRuntimeContext, isPromise, recycleRunTime} from '../util/util';
import {applyRule} from './validate';
import {isPlainObject, isNil, isEmpty} from 'lodash';
import {ApiRule, ValidateRules} from './types';
import {compileExpressionString, isExpression, parseExpressionString} from '../util/vm';

export interface FormItemProps extends BasicProps {
    required?: boolean;
    rules: ValidateRules[];

    /**
     * 使用接口进行自动验证
     */
    apiRule?: ApiRule;
    filterRule?: any;
    isTextFormItem?: boolean;
    filterErrMsg?: any;
    /**
     * 来自Form组件的context
     */
    formContext: FormContextType;

    control?: any;
    children?: any;
}

export class RCREFormItem extends React.Component<FormItemProps, {}> {
    // private infoBlackList: string[];
    private isApiValidate: boolean;
    private isUnMounted?: boolean;

    static getComponentParseOptions() {
        return {
            blackList: ['filterRule', 'filterErrMsg']
        };
    }

    constructor(props: FormItemProps) {
        super(props);

        // this.infoBlackList = ['filterRule', 'filterErrMsg'];
        this.isApiValidate = false;
        this.isUnMounted = false;
    }

    private initFormItem = () => {
        let valid = true;
        let required = this.props.required;

        if (this.props.rules && !this.props.required) {
            required = this.props.rules.some(rule => !!rule.required);
        }

        if ('required' in this.props) {
            valid = !this.props.required;
        }

        if (this.props.isTextFormItem) {
            valid = true;
        }
        // let name = this.nextName;
        // let disabled = this.nextDisabled;

        // if (disabled) {
        //     this.props.formContext.$setFormItem({
        //         formItemName: name,
        //         rules: this.props.rules,
        //         status: 'success',
        //         errorMsg: '',
        //         required: required,
        //         valid: valid
        //     });
        //     return;
        // }

        let formValue = this.props.containerContext.$getData(name);

        let formDataEmpty = false;
        if (typeof formValue === 'object') {
            formDataEmpty = isEmpty(formValue);
        } else {
            formDataEmpty = isNil(formValue);
        }

        if (!formDataEmpty || isExpression(this.props.filterRule)) {
            this.validateFormItem(name, formValue);
        } else {
            this.props.formContext.$setFormItem({
                formItemName: name,
                rules: this.props.rules,
                status: 'success',
                errorMsg: '',
                required: required,
                valid: valid
            });
        }
    }

    componentDidMount() {
        this.initFormItem();
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
            console.log(exportValue);
            console.warn('apiRule的export属性，需要返回一个普通对象作为返回值');
        }

        return;
    }

    private apiValidate = async (apiRule: ApiRule, formItemName: string, value: any) => {
        let runTime = getRuntimeContext(this.props.containerContext, this.props.rcreContext, {
            formContext: this.props.formContext,
            iteratorContext: this.props.iteratorContext
        });

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

        this.props.rcreContext.dataProviderEvent.addToList(apiRule.url);

        let ret = await request(apiRule.url, {
            url: apiRule.url,
            method: apiRule.method,
            data: data,
            formSubmit: apiRule.formSubmit
        }, runTime.$global.proxy);

        // 如果这个时候直接unmount，会有异常
        if (this.isUnMounted) {
            this.props.rcreContext.dataProviderEvent.clear();
            return;
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

        this.props.rcreContext.dataProviderEvent.setToDone(apiRule.url);

        if (isValid) {
            this.props.formContext.$setFormItem({
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

            this.props.formContext.$setFormItem({
                formItemName: formItemName,
                valid: false,
                rules: this.props.rules,
                errorMsg: errmsg || '',
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

    private validateFormItem = (
        formItemName: string,
        data: any
    ) => {
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
            this.props.formContext.$setFormItem({
                formItemName: formItemName,
                valid: true,
                status: 'success',
                errorMsg: '',
                rules: this.props.rules,
                required: required || false
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
            let ret = this.validFilterRule(filterRule!, data, runTime, this.props.filterErrMsg);
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

                    this.props.formContext.$setFormItem({
                        formItemName: formItemName,
                        valid: false,
                        rules: this.props.rules,
                        status: 'error',
                        required: required || false,
                        errorMsg: apiFailedMsg || '验证接口调用失败'
                    });
                });

                this.isApiValidate = true;
                this.props.formContext.$setFormItem({
                    formItemName: formItemName,
                    valid: true,
                    errorMsg: '',
                    rules: this.props.rules,
                    required: required || false,
                    status: 'validating'
                });

                return;
            }
        }

        if (isValid) {
            this.props.formContext.$setFormItem({
                formItemName: formItemName,
                valid: true,
                status: 'success',
                errorMsg: '',
                rules: this.props.rules,
                required: this.props.required || false
            });
        } else {
            this.props.formContext.$setFormItem({
                formItemName: formItemName,
                valid: false,
                status: 'error',
                errorMsg: errmsg,
                rules: this.props.rules,
                required: this.props.required || false
            });
        }

        recycleRunTime(runTime);
    }

    private handleChange = (name: string, data: any) => {
        // 输入值改变，需要重置API请求锁
        this.isApiValidate = false;
        this.validateFormItem(name, data);
        this.props.containerContext.$setData(name, data);
    }

    private handleDelete = (name: string) => {
        this.props.formContext.$deleteFormItem(name);
        this.props.containerContext.$deleteData(name);
    }

    // private getFormItemControl = (formItemName: string): FormItemState => {
    //     return this.props.formContext.$getFormItem(formItemName);
    // }

    private handleBlur = () => {
        // // 针对某些含有多个name属性的组件，可以考虑在组件初始化的时候，往formItem组件注册多个name值
        // if (!this.nextDisabled) {
        //     let value = this.props.containerContext.$getData(this.nextName);
        //     this.validateFormItem(this.nextName, value);
        // }

        this.forceUpdate();
    }

    private getFormItemValidInfo = (): { valid: boolean, errmsg: string } => {
        // let controlInfo = this.getFormItemControl(this.nextName);
        // if (!controlInfo.valid) {
        //     return {
        //         valid: false,
        //         errmsg: controlInfo.errorMsg || ''
        //     };
        // }

        return {
            valid: true,
            errmsg: ''
        };
    }

    render() {
        let formItemStatus = this.getFormItemValidInfo();

        let context: FormItemContextType = {
            $handleBlur: this.handleBlur,
            $validateFormItem: this.validateFormItem,
            valid: formItemStatus.valid,
            errmsg: formItemStatus.errmsg
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