import React from 'react';
import {
    RCREContainer,
    ContainerContext,
    RCREContext,
    IteratorContext,
    TriggerContext,
    ContainerProps,
} from 'rcre';

export class Container extends React.Component<ContainerProps, {}> {
    render() {
        return (
            <RCREContext.Consumer>
                {rcreContext => <ContainerContext.Consumer>
                    {containerContext => <IteratorContext.Consumer>
                        {iteratorContext => <TriggerContext.Consumer>
                            {triggerContext => {
                                return (
                                    <RCREContainer
                                        {...this.props}
                                        containerContext={containerContext}
                                        iteratorContext={iteratorContext}
                                        rcreContext={rcreContext}
                                        triggerContext={triggerContext}
                                    >
                                        {this.props.children}
                                    </RCREContainer>
                                );
                            }}
                        </TriggerContext.Consumer>}
                    </IteratorContext.Consumer>}
                </ContainerContext.Consumer>}
            </RCREContext.Consumer>
        );
    }
}