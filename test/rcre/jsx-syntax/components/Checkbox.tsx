import {ES} from 'rcre';
import React from 'react';

export class Checkbox extends React.Component<any, any> {
    render() {
        return (
            <ES type={'checkbox'} name={this.props.name}>
                {({$data}, context) => {
                    return (
                        <input
                            type={'checkbox'}
                            checked={$data}
                            onChange={event => {
                                context.container.$setData(this.props.name, event.target.checked);
                            }}
                        />
                    );
                }}
            </ES>
        );
    }
}