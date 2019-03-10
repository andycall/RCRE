import {SyncAdaptor} from '../adaptors/sync';
import {ProviderSourceConfig} from '../Controller';
import {runTimeType} from '../../Container';

interface CookieConfig extends ProviderSourceConfig {
    config: string[];
}

function getAllCookie() {
    let cookies = document.cookie;
    let result = {};
    let list = cookies.split(';');
    
    list.forEach(item => {
        let cookie = item.split('=');
        let key = cookie[0].replace(/\s+/, '');
        result[key] = decodeURIComponent(cookie[1]);
    });

    return result;
}

export class CookieAdaptor extends SyncAdaptor {
    exec(provider: CookieConfig, runTime: runTimeType) {
        let items = provider.config;
        let ret = {};
        let cookies = getAllCookie();

        items.forEach(key => {
            let result = cookies[key];

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