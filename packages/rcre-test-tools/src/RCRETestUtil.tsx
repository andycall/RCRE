import React from 'react';
import {get, flatten} from 'lodash';
import chalk from 'chalk';
import {mount, ReactWrapper} from 'enzyme';
import {ReactElement} from 'react';
import {PageProps, Render, store, RootState, vm} from 'rcre';
const format = require('json-format');

interface DebugOptions {
    // 显示原始ExpressionString内容
    raw?: boolean;
    // 输出dataProvider
    showDataProvider?: boolean;
    // 输出dataCustomer
    showDataCustomer?: boolean;
    // 输出props
    showProps?: boolean;
    // 输出export
    showExport?: boolean;
}

export class RCRETestUtil {
    public config: PageProps<any>;
    public component: ReactElement<any>;
    public wrapper: ReactWrapper;
    public container: ReactWrapper;
    public model: string;

    constructor(config: PageProps<any>, global: object = {}) {
        this.config = config;
        this.component = <Render code={config} global={global} />;
        this.wrapper = mount(this.component);
    }

    /**
     * 销毁整个应用
     */
    public unmount() {
        this.wrapper.unmount();
    }

    /**
     * 设置当前搜索的container
     * @param model {string} Container组件model属性的值
     */
    public setContainer(model: string) {
        this.model = model;
    }

    /**
     * 根据提供的访问路径，判断state中的组件的值是否正确
     * @param path 对象访问路径
     * @param value 验证的值
     */
    public expectWithPath(path: string, value: any) {
        if (!this.model) {
            throw new Error('please set your container first');
        }

        let state = store.getState();
        // @ts-ignore
        expect(get(state.container[this.model], path)).toBe(value);
    }

    /**
     * 根据一组提供的访问路径，判断state中的组件的值是否正确
     * @param group
     */
    public expectGroupWithPath(group: any[][]) {
        let state = store.getState();

        if (!this.model) {
            throw new Error('please set your container first');
        }

        for (let i = 0; i < group.length; i ++) {
            let item = group[i];
            let result = get(state.container[this.model], item[0]);
            let expected = item[1];

            if (result !== expected) {
                throw new Error(`state value is not equal, name: ${item[0]} expect: ${item[1]}, recevied: ${result} `);
            }
        }
    }

    /**
     * 获取一个组件的当前计算之后的属性
     * @param component
     */
    public componentToJSON(component: ReactWrapper) {
        let instance: any = component.instance();
        return instance.TEST_INFO;
    }

    /**
     * 触发RCREForm组件的提交事件
     * @param component
     * @param preventSubmit {boolean} 阻止表单的发送
     */
    public async triggerFormSubmit(component: ReactWrapper, preventSubmit: boolean = false) {
        let instance: any = component.instance();
        let info = instance.props.info;

        if (info.type !== 'form') {
            throw new Error('component should be form');
        }

        return await instance.triggerSubmit(preventSubmit);
    }

    /**
     * 找到某个Container组件
     * @param model
     */
    public getContainer(model: string) {
        this.wrapper.update();
        let container = this.wrapper.find('RCREContainer[selfModel="' + model + '"]');

        if (!container.exists()) {
            throw new Error('container:' + model + ' is not exist');
        }

        if (container.length !== 1) {
            throw new Error('container model repeat, model: ' + model);
        }

        return container;
    }

    /**
     * 通过type找到某个Container组件下的某个组件
     * @param type {string} 组件类型
     * @param index {number} 返回第index个组件
     * @return {ReactWrapper}
     */
    public getComponentByType(type: string, index: number = 0): ReactWrapper {
        if (!this.model) {
            throw new Error('please set your container first');
        }
        let container = this.getContainer(this.model);

        let elements: ReactWrapper[] = [];
        for (let i = 0; i < container.children().length; i ++) {
            this.find(container.childAt(i), elements, 'RCREConnect(' + type + ')');
        }

        if (elements.length === 0) {
            throw new Error('component:' + type + ' is not exist');
        }

        return elements[index];
    }

    /**
     * 获取应用最外层的Form组件
     */
    public getRootForm() {
        return this.wrapper.find('RCREForm').at(0);
    }

    /**
     * 通过type判断当前Container下面是否含有组件
     * @param type 组件类型
     * @param index 第index个组件
     */
    public hasComponentByType(type: string, index: number = 0): boolean {
        if (!this.model) {
            throw new Error('please set your container first');
        }
        let container = this.getContainer(this.model);

        let elements: ReactWrapper[] = [];
        for (let i = 0; i < container.children().length; i ++) {
            this.find(container.childAt(i), elements, 'RCREConnect(' + type + ')');
        }

        if (elements.length === 0) {
            return false;
        }

        return !!elements[index];
    }

    /**
     * 通过name找到某个Container组件下的某个组件
     * @param name {string} 组件的name属性
     * @param index {number} 返回第index个组件
     * @return {ReactWrapper}
     */
    public getComponentByName(name: string, index: number = 0): ReactWrapper {
        if (!this.model) {
            throw new Error('please set your container first');
        }
        let container = this.getContainer(this.model);
        let elements: ReactWrapper[] = [];
        for (let i = 0; i < container.children().length; i ++) {
            this.find(container.childAt(i), elements, (element) => {
                let instance: any = element.instance();
                if (!instance) {
                    return false;
                }

                let info = instance.TEST_INFO;

                if (!info || !info.name) {
                    return false;
                }

                if (element.name() === 'RCRETrigger') {
                    return false;
                }

                return info.name === name;
            });
        }

        if (elements.length === 0) {
            throw new Error('name: ' + name + ' is not exist');
        }

        return elements[index];
    }

    public getComponentFormStatus(component: ReactWrapper) {
        let props: any = component.instance().props;

        if (!props.$form) {
            return null;
        }

        return props.$form;
    }

    /**
     * 通过name判断当前Container组件下是否含有组件
     * @param name 组件的name值
     * @param index 第N个
     */
    public hasComponentByName(name: string, index: number = 0): boolean {
        if (!this.model) {
            throw new Error('please set your container first');
        }

        let container = this.getContainer(this.model);
        let elements: ReactWrapper[] = [];
        for (let i = 0; i < container.children().length; i ++) {
            this.find(container.childAt(i), elements, (element) => {
                let info: any = element.prop('info');

                if (!info || !info.name) {
                    return false;
                }

                return info.name === name;
            });
        }

        if (elements.length === 0) {
            return false;
        }

        return !!elements[index];
    }

    private find(root: ReactWrapper, elements: ReactWrapper[], selector: ((n: ReactWrapper) => boolean) | string) {
        let children = root.children();
        let name = root.name();

        if (name === 'RCREContainer') {
            return;
        }

        let match;

        if (typeof selector === 'function') {
            match = selector(root);
        } else {
            match = root.is(selector);
        }

        if (match) {
            elements.push(root);
        }

        for (let i = 0; i < children.length; i ++) {
            let child = children.at(i);
            this.find(child, elements, selector);
        }
    }

    /**
     * 获取当前应用的状态
     */
    public getState(): RootState {
        return store.getState();
    }

    /**
     * 判断组件绑定的name属性的值是否满足组件要求
     * @param component
     */
    public isNameValid(component: ReactWrapper) {
        let instance: any = component.instance();
        return instance.TEST_isNameValid();
    }

    /**
     * 读取Container组件的状态
     * @param container
     */
    public getContainerState(container?: string) {
        let state = store.getState();

        if (!container) {
            if (this.model) {
                container = this.model;
            } else {
                throw new Error('please set your container first !');
            }
        }

        return state.container[container];
    }

    /**
     * 读取表单的状态
     * @param {string} form form组件的name
     */
    public getFormState(form: string) {
        let state = store.getState();

        if (!state.form[form]) {
            throw new Error('can not find form name: ' + form);
        }

        return state.form[form];
    }

    /**
     * 获取一个组件的RCRE配置
     * @param component
     */
    public getComponentInfo(component: ReactWrapper) {
        let instance: any = component.instance();
        return instance.props.info;
    }

    /**
     * 读取某个表单项的状态
     * @param {string} form Form组件的name
     * @param {string} name 组件的name值
     */
    public getFormItemState(form: string, name: string) {
        let formState = this.getFormState(form);
        return formState.control[name];
    }

    /**
     * 触发组件的一个事件内的一组回调
     * @param component {ReactWrapper} RCRE组件
     * @param event {string} 触发的事件
     * @param args {object} 事件变量$args的值
     */
    public async simulate(component: ReactWrapper, event: string, args: object = {}) {
        let instance: any = component.instance();
        await instance.TEST_simulateEvent(event, args);
        this.wrapper.update();
    }

    /**
     * 触发trigger中某一个事件
     * @param component
     * @param event
     * @param args
     * @param index
     */
    public async simulateByIndex(component: ReactWrapper, event: string, args: object = {}, index: number) {
        let instance: any = component.instance();
        await instance.TEST_simulateEventOnce(event, args, index);
        this.wrapper.update();
    }

    /**
     * 依据组件的name属性，container组件写值
     * @param component
     * @param value
     */
    public setData(component: ReactWrapper, value: any) {
        let instance: any = component.instance();
        instance.TEST_setData(value);
        this.wrapper.update();
    }

    /**
     * 直接设置当前Container的state
     * @param name
     * @param value
     */
    public setState(name: string, value: any) {
        if (!this.model) {
            throw new Error('please set your container first');
        }

        let container: any = this.getContainer(this.model).instance();
        container.TEST_setData(name, value);
    }

    /**
     * 读取组件某个属性的值
     * @param property 属性名称
     * @return {any}
     */
    public getDataOfProperty(component: ReactWrapper, property: string) {
        let instance: any = component.instance();
        let info = instance.TEST_getData();

        if (!info.hasOwnProperty(property)) {
            throw new Error('can not find property: ' + property);
        }

        return info[property];
    }

    /**
     * 依据当前组件在Container组件中存储的值
     */
    public getComponentNameValue(component: ReactWrapper) {
        let instance: any = component.instance();
        let info = instance.TEST_getData();

        if (!info.name) {
            throw new Error('component did"t have name property');
        }

        return instance.TEST_getNameValue(info.name);
    }

    /**
     * 输出当前组件和所有子组件的结构
     * @param node {ReactWrapper} 根节点
     * @param options {DebugOptions} 输入配置
     */
    public debug(node?: ReactWrapper, options?: DebugOptions): string {
        if (!this.model) {
            throw new Error('please set your container first');
        }

        let container = this.getContainer(this.model);
        if (node) {
            container = node;
        }

        // @ts-ignore
        let nodeInternal = container.getNodesInternal()[0];
        let lines: string[] = [];
        let comments: {
            [type: string]: string;
        } = {};
        this.debugNode(nodeInternal, 0, lines, comments, options);
        return lines.join('\n') + '\n' + '\n' + this.formatComments(comments);
    }

    private formatComments(comments: {[type: string]: string}) {
        let str = '';

        Object.keys(comments).forEach(key => {
            str += chalk.cyan(key + 'Config') + ': ' + format(JSON.parse(comments[key]));

            str += '\n';
        });

        return str;
    }

    private lineIndent(depth: number) {
        let str = '';

        for (let i = 0; i < depth; i++) {
            str += '  ';
        }

        return str;
    }

    private getRawNodeInfo(node: any) {
        let type = node.type.displayName;

        // Driver组件，读取Connect信息
        if (/RCRE\(\w+\)/.test(type)) {
            return node.instance.props.tools.env.info;
        }

        // 其余情况
        return node.props.info;
    }

    private isRCREConfig(value: any) {
        let valid = false;
        if (value instanceof Array) {
            valid = value.every(v => v.hasOwnProperty('type'));
        } else {
            valid = value.hasOwnProperty('type');
        }

        return valid;
    }

    private debugNode(node: any, depth: number, lines: string[], comments: {[type: string]: string}, options?: DebugOptions) {
        if (!node) {
            return;
        }

        let rendered = Array.isArray(node.rendered) ? flatten(node.rendered) : [node.rendered];
        let nextDepth = depth;

        if (node && node.instance && node.instance.TEST_INFO) {
            let info = (options && options.raw) ? this.getRawNodeInfo(node) : node.instance.TEST_INFO;
            let type = info.type;

            let rawInfo = this.getRawNodeInfo(node);
            let compiledProps = Object.keys(rawInfo).filter(i => {
                return vm.isExpression(rawInfo[i]);
            });

            if (!type) {
                return;
            }

            let propStr: string = '';

            Object.keys(info).forEach(key => {
                let value = info[key];

                if (typeof value === 'string') {
                    value = '"' + value + '"';
                }

                if (typeof value === 'object' && value !== null) {
                    if (this.isRCREConfig(value)) {
                        return;
                    }

                    value = JSON.stringify(value).replace(/[\s\n\t]/g, '');
                    // 超长的内容单独在最下面的显示
                    if (value.length > 240) {
                        if (options) {
                            if (options.showExport && key === 'export') {
                                comments[key] = value;
                            }

                            if (options.showProps && key === 'props') {
                                comments[key] = value;
                            }

                            if (options.showDataCustomer && key === 'dataCustomer') {
                                comments[key] = value;
                            }

                            if (options.showDataProvider && key === 'dataProvider') {
                                comments[key] = value;
                            }
                        }

                        value = chalk.cyan(`[${key}Config]`);
                    }
                }

                if (typeof value === 'function') {
                    return;
                }

                switch (key) {
                    case 'name':
                        propStr += ' ' + chalk.blue(`name=${value}`);
                        break;
                    case 'dataProvider':
                    case 'dataCustomer':
                    case 'props':
                    case 'export': {
                        propStr += chalk.bold(` ${key}=${value}`);
                        break;
                    }
                    case 'type':
                    case 'children':
                        break;
                    default: {
                        // 把使用表达式解析的值变成原谅绿
                        if (compiledProps.indexOf(key) >= 0) {
                            propStr += chalk.green(` ${key}=${value}`);
                            break;
                        }

                        propStr += ` ${key}=${value}`;
                    }
                }
            });

            lines.push(this.lineIndent(depth) + `${type}${propStr}`);

            if (rendered.length > 0) {
                nextDepth++;
            }
        }

        // 隐藏的元素
        if (node && node.props && node.props.className === 'rcre-hidden-element') {
            let hiddenInfo = JSON.parse(node.rendered[0]);
            this.walkHiddenInfo(hiddenInfo, depth, lines);
        }

        rendered.forEach(n => this.debugNode(n, nextDepth, lines, comments, options));

        // if (node && node.instance && node.instance.TEST_INFO) {
        //     let type = node.instance.TEST_INFO.type;
        //     lines.push(this.lineIndent(depth) + `</${type}>`);
        // }
    }

    private walkHiddenInfo(hiddenInfo: any, depth: number, lines: string[]) {
        let type = hiddenInfo.type;

        let propStr: string = '';
        Object.keys(hiddenInfo).forEach(propKey => {
            let value = hiddenInfo[propKey];

            if (this.isRCREConfig(value)) {
                return;
            }

            switch (propKey) {
                case 'type':
                case 'children':
                    break;
                default:
                    propStr += ` ${propKey}=${value}`;
            }
        });

        lines.push(this.lineIndent(depth) + chalk.gray(`${type}${propStr}`));

        Object.keys(hiddenInfo).forEach(propKey => {
            if (this.isRCREConfig(hiddenInfo[propKey])) {
                let rcreConfig = hiddenInfo[propKey];

                if (rcreConfig instanceof Array) {
                    rcreConfig.forEach(config => this.walkHiddenInfo(config, depth + 1, lines));
                } else {
                    this.walkHiddenInfo(rcreConfig, depth + 1, lines);
                }
            }
        });
    }
}

export async function simulate(wrapper: any, component: any, event: string, args: object = {}) {
    let instance: any = component.instance();
    await instance.TEST_simulateEvent(event, args);
    wrapper.update();
}

export function setData(component: any, value: any) {
    let instance: any = component.instance();
    instance.TEST_setData(value);
}