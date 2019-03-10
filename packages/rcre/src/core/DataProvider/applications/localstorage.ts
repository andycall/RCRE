import {SyncAdaptor} from '../adaptors/sync';
import {ProviderSourceConfig} from '../Controller';
import {runTimeType} from '../../Container';

interface LocalStorageConfig extends ProviderSourceConfig {
    config: string[];
}

export class LocalStorageAdaptor extends SyncAdaptor {
    exec(provider: LocalStorageConfig, runTime: runTimeType) {
        let items = provider.config;
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