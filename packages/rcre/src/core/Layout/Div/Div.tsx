import {CSSProperties} from 'react';
import * as React from 'react';
import {createChild} from '../../util/createChild';
import {BasicProps} from '../../../types';
import {componentLoader} from '../../util/componentLoader';

export interface DivProps extends BasicProps {
    children: any[];
    style?: CSSProperties;
}

function JSONDiv(props: DivProps) {
    let children = props.children;

    if (!(children instanceof Array)) {
        children = [];
    }

    const buildInStyle = {
        width: '100%',
        outline: props.rcreContext.debug ? '1px dashed #B8B8B8' : ''
    };

    return (
        <div
            style={{
                ...buildInStyle,
                ...props.style
            }}
            onClick={(event) => props.triggerContext.eventHandle('onClick', event)}
            onMouseDown={(event) => props.triggerContext.eventHandle('onMouseDown', event)}
            onMouseUp={(event) => props.triggerContext.eventHandle('onMouseUp', event)}
            {...props}
        >
            {
                children.map((child, key) => {
                    return createChild(child, {
                        key: key
                    });
                })
            }
        </div>
    );
}

componentLoader.addComponent('div', JSONDiv, '__BUILDIN__');