import {PageConfig} from 'rcre';
import chalk from 'chalk';
import {get, isEqual, find} from 'lodash';
import format from 'pretty-format';
import {Store} from 'redux';
import {RCRETestUtil} from './RCRETestUtil';

export interface StepItem {
    // 是否启用
    enable?: boolean;
    // 定位的name
    name?: string;
    // 定位的type
    type?: string;
    // 第index个
    index?: number;
    // 写入的值
    value?: any;
    // 开启此选项，会关闭对trigger事件的校验，完全手动控制组件的交互
    manual?: boolean;
    event?: {
        eventName: string;
        args: Object;
    }[];
}

const printFunctionFormatPlugin = {
    test: (value: any) => typeof value === 'function',
    print: (value: any) => value.toString()
};

export type StepCommand =  'submit' | 'checkForm';
export type Step = (StepItem | StepCommand | StepContainer | undefined);

export interface StepContainer {
    container: string;
    steps: Step[];
}

export type StepList = (StepContainer | StepCommand)[];

export interface RobotOptions {
    // 运行结束后验证输入和state中的值
    // default: true
    disableCheckStateResult?: boolean;
    // 验证表单项的状态
    // default: true
    disableValidateForm?: boolean;
    // 输出日志
    verbose?: boolean;
}

export class AutomaticRobot {
    public test: RCRETestUtil;
    public options: RobotOptions;

    constructor(config: PageConfig<any>, globals: object = {}, store?: Store<any>) {
        this.test = new RCRETestUtil(config, globals);
        this.options = {};
    }

    public setOptions(options: RobotOptions = {}) {
        Object.assign(this.options, options);
    }

    public async submitForm(preventSubmit: boolean) {
        this.test.wrapper.update();
        await this.test.waitForDataProviderComplete();
        let form = this.test.getRootForm();
        let state = form.state();
        let valid = state.valid;

        if (!valid) {
            let errorFormItems: string[][] = [];

            Object.keys(state.control).forEach(key => {
                if (!state.control[key].valid) {
                    errorFormItems.push([key, state.control[key].errorMsg]);
                }
            });

            throw new Error('Form is not valid, invalid formItems: ' + JSON.stringify(errorFormItems));
        }

        return await this.test.triggerFormSubmit(form, preventSubmit);
    }

    private async execScripts(scripts: StepList) {
        let index = 0;
        while (index < scripts.length) {
            let item = scripts[index];

            // 触发表单提交
            if (typeof item === 'string' && item === 'submit') {
                this.test.wrapper.update();
                let form = this.test.getRootForm();
                let state = form.state();
                let valid = state.valid;

                if (!valid) {
                    let errorFormItems: string[] = [];

                    Object.keys(state.control).forEach(key => {
                        if (!state.control[key].valid) {
                            errorFormItems.push(key);
                        }
                    });

                    throw new Error('Form is not valid, invalid formItems: ' + errorFormItems.join(','));
                }

                await this.test.triggerFormSubmit(form);

                console.log('submit finished');
                index++;
                continue;
            }

            if (typeof item === 'string' && item === 'checkForm') {
                this.checkState(scripts);
                index++;
                continue;
            }

            if (!item) {
                index++;
                continue;
            }

            let container = item.container;
            this.test.setContainer(container);

            if (this.options.verbose) {
                console.log(chalk.blue('enter container: ' + chalk.bold(container)));
            }

            let steps = item.steps;

            if (!Array.isArray(steps)) {
                throw new Error('container->steps is not array');
            }

            let stepIndex = 0;
            while (stepIndex < steps.length) {
                let stepItem = steps[stepIndex];

                if (typeof stepItem === 'string' && stepItem === 'submit') {
                    stepIndex++;
                    continue;
                }

                if (typeof stepItem === 'string' && stepItem === 'checkForm') {
                    if (this.options.verbose) {
                        console.log(chalk.bold(chalk.green('rechecking form status...')));
                    }
                    this.checkState(scripts);
                    stepIndex++;
                    continue;
                }

                if (!stepItem) {
                    stepIndex++;
                    continue;
                }

                if (stepItem.hasOwnProperty('container')) {
                    stepItem = stepItem as StepContainer;
                    await this.execScripts([stepItem]);
                    stepIndex++;
                    continue;
                }

                stepItem = stepItem as StepItem;

                if (stepItem.enable === false) {
                    stepIndex++;
                    continue;
                }

                let name = stepItem.name;
                let type = stepItem.type;

                let component;
                if (name) {
                    component = this.test.getComponentByName(name, stepItem.index || 0);
                } else if (type) {
                    component = this.test.getComponentByType(type, stepItem.index || 0);
                } else {
                    throw new Error('steps: items should have name or type property');
                }

                if (name && stepItem.hasOwnProperty('value')) {
                    let existValue = this.test.getComponentNameValue(component);

                    if (isEqual(existValue, stepItem.value)) {
                        if (this.options.verbose) {
                            console.log(chalk.gray(`found component[name=${name}] have exist value. skip..`));
                        }
                        stepIndex++;
                        continue;
                    }
                }

                if ('value' in stepItem) {
                    if (this.options.verbose) {
                        if (name) {
                            console.log(chalk.red(`start to setData, name: ${chalk.bold(name)}`));
                        } else if (type) {
                            console.log(chalk.red(`start to setData, type: ${chalk.bold(type)}`));
                        }
                    }
                    this.test.setData(component, stepItem.value);
                    let isValid = this.test.isNameValid(component);

                    if (this.options.verbose) {
                        if (name) {
                            console.log(chalk.green(`component value check success. name: ${chalk.bold(name)}, index: ${index}`));
                        } else if (type) {
                            console.log(chalk.green(`component value check success. type: ${chalk.bold(type)}, index: ${index}`));
                        }
                    }

                    if (!isValid) {
                        throw new Error('StepItem: item value is not valid. \n' + format(stepItem, {
                            plugins: [printFunctionFormatPlugin]
                        }));
                    }
                }

                let componentInfo = this.test.getComponentInfo(component);

                if (componentInfo.trigger && stepItem.manual && this.options.verbose) {
                    console.log(chalk.cyan(`trigger check closed, enter manual mode`));
                }

                // 手动模式关闭检测功能
                if (componentInfo.trigger && !stepItem.manual) {

                    if (!stepItem.event) {
                        throw new Error(`StepItem: if the component contains a trigger attribute, then the test must have an events attribute to cover. 
stepItem: ${format(stepItem, {
    plugins: [printFunctionFormatPlugin]
                        })}
info: ${format(componentInfo.trigger, {
    plugins: [printFunctionFormatPlugin]
                        })}`);
                    }

                    let stepItemEvent = stepItem.event;

                    let triggerList = componentInfo.trigger.filter((eventItem: any) => {
                        let match = find(stepItemEvent, se => se.eventName === eventItem.event);

                        if (match) {
                            return false;
                        }

                        return true;
                    });

                    if (triggerList.length > 0) {
                        throw new Error('StepItem: trigger event did not fully covered');
                    }
                }

                if (Array.isArray(stepItem.event)) {
                    for (let i = 0; i < stepItem.event.length; i ++) {
                        if (this.options.verbose) {
                            if (name) {
                                console.log(chalk.blue(`simulate event, name: ${name}, index: ${index}, eventName: ${stepItem.event[i].eventName}, args: ${JSON.stringify(stepItem.event[i].args)}`));
                            } else if (type) {
                                console.log(chalk.blue(`simulate event, type: ${type}, index: ${index}, eventName: ${stepItem.event[i].eventName}, args: ${JSON.stringify(stepItem.event[i].args)}`));
                            }
                        }

                        await this.test.simulate(component, stepItem.event[i].eventName, stepItem.event[i].args);
                    }
                }

                if (stepItem.name && stepItem.hasOwnProperty('value')) {
                    let state = this.test.getState();
                    let stateValue = get(state.container, '[' + container + '][' + stepItem.name + ']');
                    if (!isEqual(stateValue, stepItem.value) && !this.options.disableCheckStateResult) {
                        throw new Error(`CheckState failed: ${stepItem.name} is not equal; state: ${stateValue}, expect: ${stepItem.value}`);
                    }

                    component = this.test.getComponentByName(stepItem.name, stepItem.index || 0);
                    let formState = this.test.getComponentFormStatus(component);

                    if (formState && !this.options.disableValidateForm) {
                        let formItemStatus = this.test.getFormItemState(formState.name, stepItem.name);

                        if (formItemStatus && !formItemStatus.valid) {
                            throw new Error(`CheckState failed: ${stepItem.name}'s form status is not valid. errmsg: ${formItemStatus.errorMsg}`);
                        }
                    }
                }

                if (this.options.verbose) {
                    console.log(chalk.green('item check success.'));
                }

                await this.test.waitForDataProviderComplete();

                stepIndex++;
            }

            index++;
        }
    }

    private checkState(scripts: StepList) {
        let state = this.test.getState();
        let container = state.container;

        let index = 0;
        while (index < scripts.length) {
            let item = scripts[index];

            if (typeof item === 'string') {
                index++;
                continue;
            }

            if (!item) {
                index++;
                continue;
            }

            let model = item.container;
            this.test.setContainer(model);

            let steps = item.steps;
            let stepIndex = 0;

            while (stepIndex < steps.length) {
                let stepItem = steps[stepIndex];
                if (typeof stepItem === 'string') {
                    stepIndex++;
                    continue;
                }

                if (!stepItem) {
                    stepIndex++;
                    continue;
                }

                if (stepItem.hasOwnProperty('container')) {
                    stepItem = stepItem as StepContainer;
                    this.checkState([stepItem]);
                    stepIndex++;
                    continue;
                }

                stepItem = stepItem as StepItem;

                if (stepItem.enable === false) {
                    stepIndex++;
                    continue;
                }

                // 这种的情况没有任何可以测试的数据
                if (!stepItem.name && stepItem.type && !stepItem.event) {
                    continue;
                }

                let component;

                if (stepItem.type) {
                    component = this.test.getComponentByType(stepItem.type, stepItem.index || 0);
                }

                if (stepItem.name) {
                    let stateValue = container[model][stepItem.name];
                    if (stateValue !== stepItem.value && !this.options.disableCheckStateResult) {
                        throw new Error(`CheckState failed: ${stepItem.name} is not equal; state: ${stateValue}, expect: ${stepItem.value}`);
                    }

                    component = this.test.getComponentByName(stepItem.name, stepItem.index || 0);
                    let formState = this.test.getComponentFormStatus(component);

                    if (formState && !this.options.disableValidateForm) {
                        let formItemStatus = this.test.getFormItemState(formState.name, stepItem.name);

                        if (!formItemStatus.valid) {
                            throw new Error(`CheckState failed: ${stepItem.name}'s form status is not valid. errmsg: ${formItemStatus.errorMsg}`);
                        }
                    }
                }

                stepIndex++;
            }

            index++;
        }
    }

    async run(scripts: StepList) {
        if (scripts.length === 0) {
            return;
        }

        await this.execScripts(scripts);
    }
}