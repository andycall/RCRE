import * as React from 'react';
import * as _ from 'lodash';
import {BasicConfig, BasicContainerPropsInterface} from '../../types';
import {ErrorBoundary} from '../ErrorBoundary';
import {componentLoader} from './componentLoader';
import {getRuntimeContext} from './util';
import {isExpression, parseExpressionString, compileExpressionString} from './vm';
import {ContainerContext, RCREContext, IteratorContext, FormContext, TriggerContext, FormItemContext} from '../context';

export function createChild<Config extends BasicConfig, T extends BasicConfig, P extends BasicContainerPropsInterface>
(info: T, childProps: any): React.ReactNode {
    if (typeof info === 'string') {
        return <span key={childProps.key}>{info}</span>;
    }

    return (
        <RCREContext.Consumer key={childProps.key}>
            {rootContext => <ContainerContext.Consumer>
                {containerContext => <IteratorContext.Consumer>
                    {iteratorContext => <FormContext.Consumer>
                        {formContext => <FormItemContext.Consumer>
                            {formItemContext => {
                                let runTime = getRuntimeContext(containerContext, rootContext, {
                                    iteratorContext: iteratorContext,
                                    formContext: formContext,
                                    formItemContext: formItemContext
                                });
                                if (Array.isArray(info)) {
                                    return info.map(i => createChild(i, childProps));
                                }

                                if (!_.isPlainObject(info)) {
                                    console.error('invalid Info Object', info);
                                    return React.createElement('div', {}, 'invalid Item Object');
                                }

                                let component: any;
                                let mode = childProps.loadMode;

                                try {
                                    component = componentLoader.getComponent(info.type, mode);
                                } catch (e) {
                                    console.error(e);
                                    return <div key={childProps.key} className="rcre-error">{e.message}</div>;
                                }

                                let show = info.show;
                                let hidden = info.hidden;

                                if (isExpression(show)) {
                                    show = parseExpressionString(show, runTime);
                                }

                                if (isExpression(hidden)) {
                                    hidden = parseExpressionString(hidden, runTime);
                                }

                                let compileOptions = {
                                    isDeep: false,
                                    blackList: [
                                        'defaultValue'
                                    ],
                                    whiteList: []
                                };

                                if (info.type === 'formItem') {
                                    debugger;
                                }

                                // 组件提供静态方法来自定义属性的编译选项
                                if ('getComponentParseOptions' in component && typeof component.getComponentParseOptions === 'function') {
                                    let customOptions = component.getComponentParseOptions();
                                    console.log(customOptions);
                                    compileOptions.blackList = compileOptions.blackList.concat(customOptions.blackList);
                                    compileOptions.whiteList = compileOptions.whiteList.concat(customOptions.whiteList || []);
                                    compileOptions.isDeep = customOptions.isDeep;
                                }

                                let parsedInfo = compileExpressionString(info, runTime, compileOptions.blackList, compileOptions.isDeep, compileOptions.whiteList);

                                let children: React.ReactNode;

                                if (show === false || hidden === true) {
                                    return null;
                                }

                                if (parsedInfo.trigger) {
                                    let RCRETrigger: any = componentLoader.getComponent('__TRIGGER__');
                                    children = (
                                        <RCRETrigger
                                            key={childProps.key}
                                            model={containerContext.model}
                                            dataCustomer={containerContext.dataCustomer}
                                            trigger={info.trigger}
                                            rcreContext={rootContext}
                                            containerContext={containerContext}
                                            iteratorContext={iteratorContext}
                                        >
                                            <TriggerContext.Consumer>
                                                {triggerContext => {
                                                    return React.createElement(component, {
                                                        ...parsedInfo,
                                                        rcreContext: rootContext,
                                                        containerContext: containerContext,
                                                        triggerContext: triggerContext,
                                                        formItemContext: formItemContext,
                                                        formContext: formContext,
                                                        iteratorContext: iteratorContext,
                                                        key: childProps.key
                                                    });
                                                }}
                                            </TriggerContext.Consumer>
                                        </RCRETrigger>
                                    );
                                } else {
                                    children = React.createElement(component, {
                                        ...parsedInfo,
                                        rcreContext: rootContext,
                                        containerContext: containerContext,
                                        formItemContext: formItemContext,
                                        formContext: formContext,
                                        iteratorContext: iteratorContext,
                                        key: childProps.key
                                    });
                                }

                                if (parsedInfo.name && rootContext.debug && parsedInfo.type !== 'form') {
                                    let name = parsedInfo.name;
                                    if (isExpression(name)) {
                                        name = parseExpressionString(name, runTime);
                                    }

                                    let value = _.get(childProps.$data, name);

                                    if (_.isObjectLike(value)) {
                                        value = JSON.stringify(value);
                                    } else if (typeof value === 'boolean') {
                                        value = String(value);
                                    } else if (typeof value === 'string') {
                                        value = '\'' + value + '\'';
                                    }

                                    children = (
                                        <div key={name} className={'rcre-name-card'}>
                                            <div className={'rcre-name-card-text'}>
                                                name: <span className={'rcre-name-card-text-name'}>{name}</span>,
                                                value: <span className={'rcre-name-card-text-value'}>{value}</span>
                                            </div>
                                            {children}
                                        </div>
                                    );
                                }

                                return (
                                    <ErrorBoundary key={childProps.key}>
                                        {children}
                                    </ErrorBoundary>
                                );
                            }}
                        </FormItemContext.Consumer>}
                    </FormContext.Consumer>}
                </IteratorContext.Consumer>}
            </ContainerContext.Consumer>}
        </RCREContext.Consumer>
    );
}