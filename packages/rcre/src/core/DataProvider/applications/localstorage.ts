import {ProviderSourceConfig, runTimeType} from '../../../types';
import {SyncAdaptor} from '../adaptors/sync';

interface LocalStorageConfig extends ProviderSourceConfig {
    config: string[];
}

export class LocalStorageAdaptor extends SyncAdaptor {
    exec(config: string[], provider: LocalStorageConfig, runTime: runTimeType) {
        let items = config;
        let ret = {};

        items.forEach(key => {
            let result = localStorage.getItem(key);

            if (typeof result === 'string') {
                try {
                    result = JSON.parse(result);
                } catch (e) {}
            }

            ret[key] = result;
        });

        return ret;
    }
}