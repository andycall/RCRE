import React from 'react';

describe('jsx', function () {
    it('div', () => {
        // let test = new RCRETestUtil()
        let component = (
            <div>
                test
            </div>
        );
        // @ts-ignore
        console.log(component.$$typeof);
    });
});