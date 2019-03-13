import {filter} from '../../../packages/rcre/src/core/util/filter';

describe('filter test', () => {
    beforeEach(() => {
        filter.clearFilter();
    });
    it('setFilter', () => {
         filter.setFilter('true', () => {
             return true;
         });

         expect(filter.hasFilter('true')).toBe(true);
    });

    it('hasFilter', () => {
        filter.setFilter('true', () => {
            return true;
        });
        expect(filter.hasFilter('true')).toBe(true);
        expect(filter.hasFilter('false')).toBe(false);
    });

    it('clearFilter', () => {
        filter.clearFilter();
        expect(filter.size()).toBe(0);
    });

    it('exec cache', () => {
        let count = 0;
        function F() {
            count++;
        }
        filter.setFilter('F', F);

        let filterFunc = filter.getFilter('F');

        filterFunc();
        filterFunc();
        filterFunc();
        filterFunc();
        filterFunc();

        expect(count).toBe(1);
    });

    it('exec cache with param not changed', () => {
        let count = 0;
        function F(...args: []) {
            count++;
        }
        filter.setFilter('F', F);

        let filterFunc = filter.getFilter('F');

        filterFunc(1);
        filterFunc(1);
        filterFunc(2);
        filterFunc(2);
        filterFunc(3);

        expect(count).toBe(3);
    });

    it('exec cache with param length', () => {
        let count = 0;
        function F(...args: []) {
            count++;
        }
        filter.setFilter('F', F);

        let filterFunc = filter.getFilter('F');

        filterFunc(1);
        filterFunc(1, 1);
        filterFunc(1, 1);
        filterFunc(1, 1, 1);
        filterFunc(1, 1, 1);
        filterFunc(1, 1);
        filterFunc(1);

        expect(count).toBe(5);
    });

    it('exec cache with different object', () => {
        let count = 0;
        function F(...args: []) {
            count++;
        }
        filter.setFilter('F', F);

        let filterFunc = filter.getFilter('F');

        filterFunc([1]);
        filterFunc([1]);
        filterFunc([1]);
        filterFunc([1]);
        filterFunc([1]);

        expect(count).toBe(5);
    });

    it('exec cache with same object', () => {
        let count = 0;
        function F(...args: []) {
            count++;
        }
        filter.setFilter('F', F);

        let filterFunc = filter.getFilter('F');
        let arr = [1];

        filterFunc(arr);
        filterFunc(arr);
        filterFunc(arr);
        filterFunc(arr);
        filterFunc(arr);

        expect(count).toBe(1);
    });
});
