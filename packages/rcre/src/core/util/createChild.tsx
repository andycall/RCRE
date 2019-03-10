import * as React from 'react';
import * as _ from 'lodash';
import {BasicContainerPropsInterface, BasicConfig, getRuntimeContext} from '../Container/types';
import '../Container/AbstractContainer';
import Form from '../Form/Form';
import {RCRETrigger} from '../Trigger';
import {componentLoader} from './componentLoader';
import {isExpression, parseExpressionString} from './vm';

export function createChild<Config extends BasicConfig, T extends BasicConfig, P extends BasicContainerPropsInterface<Config>>
(info: T, childProps: any, childElements: React.ReactNode = null): React.ReactNode {
    if (typeof info === 'string') {
        return <span>{info}</span>;
    }

    let runTime = getRuntimeContext(childProps, {});

    if (isExpression(info.show) && parseExpressionString(info.show, runTime) === false) {
        return '';
    }

    if (isExpression(info.hidden) && parseExpressionString(info.hidden, runTime) === true) {
        return '';
    }

    if (Array.isArray(info)) {
        return info.map(i => createChild(i, childProps, childElements));
    }

    if (!_.isPlainObject(info)) {
        console.error('invalid Info Object', info);
        return React.createElement('div', {}, 'invalid Item Object');
    }

    let component;
    let mode = childProps.loadMode;

    try {
        component = componentLoader.getComponent(info.type, mode);
    } catch (e) {
        console.error(e);
        return <div key={childProps.index} className="rcre-error">{e.message}</div>;
    }

    let children: React.ReactNode = React.createElement(component, childProps, childElements);

    if (info.type === 'form') {
        children = (
            <Form
                {...childProps}
            >
                {children}
            </Form>
        );
    }

    if (info.trigger) {
        children = (
            <RCRETrigger
                {...childProps}
                info={childProps.info!}
                $data={childProps.$data!}
                $setData={childProps.$setData!}
                model={childProps.model!}
                dataCustomer={childProps.dataCustomer!}
                key={childProps.key!}
            >
                {children}
            </RCRETrigger>
        );
    }

    if (info.name && childProps.debug && info.type !== 'form') {
        let name = info.name;
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

    return children;
}
