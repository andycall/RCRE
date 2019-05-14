---
id: condition
title: Customize Request Condition
---

Similar to requiredParams, condition can use function to customize the interface request, the function returns true to trigger the request, and returns false to stop the request.

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
            condition: ({$data}) => {
                if (/* some condition */) {
                    return true;
                }
                
                return false;
            }
        }
    ]}
/>
```

<iframe src="https://codesandbox.io/embed/m332l38yjx?fontsize=14&view=editor" title="m332l38yjx" style="width:100%; height:500px; border:0; border-radius: 4px; overflow:hidden;" sandbox="allow-modals allow-forms allow-popups allow-scripts allow-same-origin"></iframe>