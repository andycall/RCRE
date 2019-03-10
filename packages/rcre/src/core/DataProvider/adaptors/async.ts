import {runTimeType} from '../../Container';
import {ProviderSourceConfig} from '../Controller';

export interface AsyncAdaptorRetValue {
    success: boolean;
    data?: any;
    errmsg?: string;
}

export class AsyncAdaptor {
    constructor() {}

    public async exec(provider: ProviderSourceConfig, runTime: runTimeType): Promise<AsyncAdaptorRetValue> {
        throw new Error('AsyncAdaptor: exec function is not implemented');
    }
}