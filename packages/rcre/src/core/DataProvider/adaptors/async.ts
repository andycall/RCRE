import {ProviderSourceConfig, runTimeType} from '../../../types';

export interface AsyncAdaptorRetValue {
    success: boolean;
    data?: any;
    errmsg?: string;
}

export class AsyncAdaptor {
    constructor() {}

    public async exec(config: any, provider: ProviderSourceConfig, runTime: runTimeType): Promise<AsyncAdaptorRetValue> {
        throw new Error('AsyncAdaptor: exec function is not implemented');
    }
}