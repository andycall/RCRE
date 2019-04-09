import {ProviderSourceConfig, runTimeType} from '../../../types';

export class SyncAdaptor {
    exec(provider: ProviderSourceConfig, runTime: runTimeType): any {
        throw new TypeError(`DataProvider: ${provider.mode} is not defined`);
    }
}