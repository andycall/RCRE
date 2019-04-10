import React from 'react';
import {runTimeType, getRuntimeContext, ComponentContext, RCREContext} from 'rcre';

const ComponentConsumer = ComponentContext.Consumer;
const ProviderContext = RCREContext.Consumer;

export function ES(props: {children: (runTime: runTimeType) => any}) {
    if (typeof props.children !== 'function') {
        console.error(`ES 组件的子元素只能是个函数. 例如 \n
<ES>
    {runTime => {
        return <div>{JSON.stringify(runTime.$data)}</div>
    }}
<ES>`);
        return props.children;
    }

    return (
        <ProviderContext>
            {
                providerContext => (
                    <ComponentConsumer>
                        {componentContext => {
                            let runTime = getRuntimeContext(componentContext, providerContext);
                            return props.children(runTime);
                        }}
                    </ComponentConsumer>
                )
            }
        </ProviderContext>
    );
}