import React from 'react';
import {runTimeType, getRuntimeContext, ComponentContext, RCREContext, ComponentContextType} from 'rcre';
import {get} from 'lodash';

const ComponentConsumer = ComponentContext.Consumer;
const RCREConsumer = RCREContext.Consumer;

type ESChild = (runTime: runTimeType, context: ComponentContextType) => any;

export interface ESProps {
    children: ESChild;
    name?: string;
}

export class ES extends React.Component<ESProps> {
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

        return (
            <RCREConsumer>
                {
                    providerContext => (
                        <ComponentConsumer>
                            {componentContext => {
                                let name = this.props.name;
                                let runTime = getRuntimeContext(componentContext, providerContext);

                                if (name) {
                                    runTime.$name = name;
                                    runTime.$value = get(runTime.$data, name);
                                }

                                return this.props.children(runTime, componentContext);
                            }}
                        </ComponentConsumer>
                    )
                }
            </RCREConsumer>
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