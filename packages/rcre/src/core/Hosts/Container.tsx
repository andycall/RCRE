import * as React from 'react';
import '../Container/Container.css';
import {BasicConfig} from '../../types';
import {ContainerProps, RCREContainer} from '../Container/Container';
// import {RCREContainer} from '../Container/Container';
import {componentLoader} from '../util/componentLoader';
import {createChild} from '../util/createChild';

export type BindItem = {
    child: string;
    parent: string;
    transform?: string
};

function JSONContainer(props: ContainerProps) {
    let children = (props.children || []).map((child: BasicConfig, index: number) => {
        let elements = createChild(child, {
            key: `${child.type}_${index}`
        });

        if (props.rcreContext.debug) {
            const containerStyle = {
                border: props.rcreContext.debug ? '1px dashed #3398FC' : '',
            };

            return (
                <div className={'rcre-container'} style={containerStyle}>
                    <span>container: {props.model}</span>
                    {elements}
                </div>
            );
        }

        return elements;
    });

    return (
        <RCREContainer
            {...props}
        >
            {children}
        </RCREContainer>
    );
}

componentLoader.addComponent('container', JSONContainer, '__BUILDIN__');
