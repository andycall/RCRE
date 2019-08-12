import React, {useContext} from 'react';
import {ContainerProps, RCREContainer} from '../core/Container/Container';
import {ContainerContext, RCREContext, IteratorContext, TriggerContext} from '../core/context';

export function Container(props: ContainerProps) {
    let rcreContext = useContext(RCREContext);
    let containerContext = useContext(ContainerContext);
    let iteratorContext = useContext(IteratorContext);
    let triggerContext = useContext(TriggerContext);

    return (
        <RCREContainer
            {...props}
            rcreContext={rcreContext}
            iteratorContext={iteratorContext}
            containerContext={containerContext}
            triggerContext={triggerContext}
        />
    );
}
