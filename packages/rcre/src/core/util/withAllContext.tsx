import React from 'react';
import {ContainerContext, RCREContext, FormItemContext, TriggerContext} from '../context';
import {RCRETrigger} from '../Trigger/Trigger';

export const withAllContext: any = (Component: any) => (
    (props: any) => (
        <RCREContext.Consumer>
            {rcreContext => <ContainerContext.Consumer>
                {containerContext => {
                    let children = (
                        <TriggerContext.Consumer>
                            {triggerContext => <FormItemContext.Consumer>
                                {formItemContext => {
                                    return <Component
                                        rcreContext={rcreContext}
                                        containerContext={containerContext}
                                        triggerContext={triggerContext}
                                        formItemContext={formItemContext}
                                        {...props}
                                    />;
                                }}
                            </FormItemContext.Consumer>}
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
                }}
            </ContainerContext.Consumer>}
        </RCREContext.Consumer>
    )
);
