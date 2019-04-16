import React from 'react';
import {ContainerProps, RCREContainer} from 'rcre';

export class Container extends React.Component<ContainerProps, {}> {
    render() {
        return (
            <RCREContainer {...this.props}>
                {this.props.children}
            </RCREContainer>
        );
    }
}