import React from 'react';
import {ContainerContext, FormContext, FormItemContext, IteratorContext, RCREContext, TriggerContext} from '../context';
import {RCRETrigger} from '../Trigger/Trigger';

export const withAllContext: any = (Component: any) => (
    (props: any) => (
        <RCREContext.Consumer>
            {rcreContext => <ContainerContext.Consumer>
                {containerContext => <FormContext.Consumer>
                    {formContext => <IteratorContext.Consumer>
                        {iteratorContext => {
                            let children = (
                                <TriggerContext.Consumer>
                                    {triggerContext => <FormItemContext.Consumer>
                                        {formItemContext => {
                                            return <Component
                                                rcreContext={rcreContext}
                                                containerContext={containerContext}
                                                formContext={formContext}
                                                iteratorContext={iteratorContext}
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
                                    iteratorContext={iteratorContext}
                                    containerContext={containerContext}
                                >
                                    {children}
                                </RCRETrigger>
                            );
                        }}
                    </IteratorContext.Consumer>}
                </FormContext.Consumer>}
            </ContainerContext.Consumer>}
        </RCREContext.Consumer>
    )
);
