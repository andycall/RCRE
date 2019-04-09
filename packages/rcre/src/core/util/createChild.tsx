import * as React from 'react';
import * as _ from 'lodash';
import {BasicConfig, BasicContainerPropsInterface} from '../../types';
import {componentLoader} from './componentLoader';
import {getRuntimeContext} from './util';
import {isExpression, parseExpressionString} from './vm';

export function createChild<Config extends BasicConfig, T extends BasicConfig, P extends BasicContainerPropsInterface>
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

    if (info.trigger) {
        let RCRETrigger = componentLoader.getComponent('__TRIGGER__');
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

export function renderChildren<Config extends BasicConfig>(info: Config, children: React.ReactNode) {
    let show = info.show;
    let hidden = info.hidden;

    if (_.isObjectLike(show) || (info.hasOwnProperty('show') && info.show === undefined)) {
        show = !!show;
    }

    if (_.isObjectLike(hidden)) {
        hidden = !!hidden;
    }

    if (hidden === true || show === false) {
        return (
            <div className="rcre-hidden-element" key={info.type + '_' + Math.random()} style={{display: 'none'}}>
                {process.env.NODE_ENV === 'test' ? JSON.stringify(info) : ''}
            </div>
        );
    }

    return children;
}