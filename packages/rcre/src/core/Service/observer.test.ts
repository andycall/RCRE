import {ObserverTrack} from './observer';

describe('Observer', () => {
    it('nest arr', () => {
        let data = {
            name: {
                age: '1234',
                arr: [0]
            }
        };

        let track = new ObserverTrack(data);
        let observer = track.getObserver();

        track.exec(() => observer.name.arr[0]);
        expect(track.path[0]).toBe('name.arr[0]');
    });

    it('nest Object', () => {
        let data = {
            name: {
                age: '1234'
            }
        };
        let track = new ObserverTrack(data);
        let observer = track.getObserver();

        track.exec(() => observer.name.age);
        expect(track.path[0]).toBe('name.age');
    });

    it('two access in one exec function', () => {
        let data = {
            name: {
                age: '1234',
                height: 5555
            }
        };

        let track = new ObserverTrack(data);
        let observer = track.getObserver();

        track.exec(() => {
            return [
                observer.name.age,
                observer.name.height
            ];
        });

        expect(track.path[0]).toBe('name.age');
        expect(track.path[1]).toBe('name.height');
    });
});