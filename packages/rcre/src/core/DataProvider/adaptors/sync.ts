import {runTimeType} from '../../../types';
import {ProviderSourceConfig} from '../Controller';

export class SyncAdaptor {
    exec(provider: ProviderSourceConfig, runTime: runTimeType): any {
        throw new TypeError(`DataProvider: ${provider.mode} is not defined`);
    }
}