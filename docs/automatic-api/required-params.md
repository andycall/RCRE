---
id: required-params
title: Required Request Params
---

Each interface will only listen for changes to the config attribute by default.

If you need to depends on some data in the Container state before the sending the request, you can use the requiredParams property.

The requiredParams property value type is array. Each item in the array is the key from Container State.

Key also support Lodash path syntax.

```jsx harmony
<Container
    model={"demo"}
    dataProvider={[
        {
            mode: 'ajax',
            namespace: 'EXAMPLE_API',
            config: {
                url: '/example.com',
                method: 'GET'
            },
            // if $data.code exist, this api will request
            requiredParams: ['code']
        }
    ]}
/>
```

<iframe src="https://codesandbox.io/embed/9yx43r8184?fontsize=14&view=editor" title="9yx43r8184" style="width:100%; height:500px; border:0; border-radius: 4px; overflow:hidden;" sandbox="allow-modals allow-forms allow-popups allow-scripts allow-same-origin"></iframe>