import warning from 'warning';
export const $parent = new Proxy({}, {
    get(target: {}, p: PropertyKey, receiver: any): any {
        warning(process.env.NODE_ENV !== 'production', '在ExpressionString访问$parent已经被废弃了，请使用Container组件继承(props)来获取父级的数据');
        return null;
    }
});