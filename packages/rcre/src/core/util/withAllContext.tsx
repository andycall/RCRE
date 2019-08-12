import React, {useContext} from 'react';
import {ContainerContext, FormItemContext, RCREContext, TriggerContext} from '../context';
import {RCRETrigger} from '../Trigger/Trigger';

export const withAllContext: any = (Component: any) => (
    (props: any) => {
        let rcreContext = useContext(RCREContext);
        let containerContext = useContext(ContainerContext);
        let formItemContext = useContext(FormItemContext);

        let children = (
            <TriggerContext.Consumer>
                {triggerContext => {
                    return <Component
                        rcreContext={rcreContext}
                        containerContext={containerContext}
                        triggerContext={triggerContext}
                        formItemContext={formItemContext}
                        {...props}
                    />;
                }}
            </TriggerContext.Consumer>
        );

        if (rcreContext.mode === 'json') {
            return children;
        }

        return (
            <RCRETrigger
                model={containerContext.model}
                dataCustomer={containerContext.dataCustomer}
                trigger={props.trigger || []}
                rcreContext={rcreContext}
                containerContext={containerContext}
            >
                {children}
            </RCRETrigger>
        );
    }
);
