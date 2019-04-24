import React from 'react';
import {ContainerProps, RCREContainer} from '../core/Container/Container';
import {ContainerContext, RCREContext, IteratorContext, TriggerContext} from '../core/context';

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