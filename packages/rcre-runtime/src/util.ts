export function safeStringify(obj: Object) {
    let cache = new WeakMap();
    return JSON.stringify(obj, (key, value) => {
        if (typeof value === 'object' && value !== null) {
            if (cache.get(value)) {
                return;
            }

            cache.set(value, true);
        }

        return value;
    });
}
