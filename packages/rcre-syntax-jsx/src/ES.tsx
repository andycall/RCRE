import React from 'react';
import {
    runTimeType,
    getRuntimeContext,
    ContainerContext,
    RCREContext,
    TriggerContext,
    IteratorContext,
    FormContext,
    ContainerContextType,
    TriggerContextType,
    FormContextType,
    RCREContextType,
    IteratorContextType,
    ErrorBoundary
} from 'rcre';
import {get} from 'lodash';

type ESChild = (runTime: runTimeType, context: {
    container: ContainerContextType;
    trigger: TriggerContextType,
    form?: FormContextType,
    rcre: RCREContextType
    iterator: IteratorContextType
}) => any;

export interface ESProps {
    children: ESChild;
    name?: string;
}

export class ES extends React.Component<ESProps> {
    static displayName = 'ES';
    render() {
        if (typeof this.props.children !== 'function') {
            console.error(`ES 组件的子元素只能是个函数. 例如 \n
<ES>
    {runTime => {
        return <div>{JSON.stringify(runTime.$data)}</div>
    }}
<ES>`);
            return this.props.children;
        }

        let name = this.props.name;

        return (
            <RCREContext.Consumer>
                {rcreContext => <ContainerContext.Consumer>
                    {containerContext => <IteratorContext.Consumer>
                        {iteratorContext => <FormContext.Consumer>
                            {formContext => <TriggerContext.Consumer>
                                {triggerContext => {
                                    let context = {
                                        container: containerContext,
                                        rcre: rcreContext,
                                        form: formContext,
                                        trigger: triggerContext,
                                        iterator: iteratorContext
                                    };
                                    let runTime = getRuntimeContext(containerContext, rcreContext, {
                                        iteratorContext: iteratorContext,
                                        formContext: formContext,
                                        triggerContext: triggerContext
                                    });

                                    if (name) {
                                        runTime.$name = name;
                                        runTime.$value = get(runTime.$data, name);
                                    }

                                    return (
                                        <ErrorBoundary>
                                            {this.props.children(runTime, context) || null}
                                        </ErrorBoundary>
                                    );
                                }}
                            </TriggerContext.Consumer>}
                        </FormContext.Consumer>}
                    </IteratorContext.Consumer>}
                </ContainerContext.Consumer>}
            </RCREContext.Consumer>
        );
    }

    public async TEST_simulateEvent(event: string, args: Object = {}) {
        // return this.commonEventHandler(event, args);
    }

    public async TEST_simulateEventOnce(event: string, args: Object = {}, index: number) {
        // return this.commonEventHandler(event, args, {
        //     // 只触发指定index的事件
        //     index: index
        // });
    }

    public TEST_setData(value: any) {
        // if (this.info && this.info.name) {
        //     return this.setData(this.info.name, value);
        // }
        //
        // throw new Error('can not get component name');
    }

    public TEST_getData() {
        // return this.info;
    }

    public TEST_getNameValue(name: string) {
        // return this.getValueFromDataStore(name);
    }

    public TEST_isNameValid() {
        // if (!this.options.isNameValid) {
        //     return true;
        // }
        //
        // if (!this.info.name) {
        //     return true;
        // }
        //
        // let value = this.getValueFromDataStore(this.info.name);
        // return this.options.isNameValid(value, this.info);
    }
}