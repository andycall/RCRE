import {CSSProperties} from 'react';
import * as React from 'react';
import {BasicConnectProps} from "../../Connect/basicConnect";
import {commonConnect} from '../../Connect/Common/Common';
import {createChild} from '../../util/createChild';
import {componentLoader} from '../../util/componentLoader';

export interface DivProps extends BasicConnectProps {
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
        outline: props.tools.rcreContext.debug ? '1px dashed #B8B8B8' : ''
    };

    return (
        <div
            style={{
                ...buildInStyle,
                ...props.style
            }}
            onClick={(event) => props.tools.triggerContext && props.tools.triggerContext.eventHandle('onClick', event)}
            onMouseDown={(event) => props.tools.triggerContext && props.tools.triggerContext.eventHandle('onMouseDown', event)}
            onMouseUp={(event) => props.tools.triggerContext && props.tools.triggerContext.eventHandle('onMouseUp', event)}
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

componentLoader.addComponent('div', commonConnect()(JSONDiv), '__BUILDIN__');