---
id: response-rewrite
title: Rewrite Response Data Before SetState
---

When you need to process the data returned by the interface and then write it to the Container, you can use the `responseRewrite` property.

The `responseRewrite` property need an object. 

Each property value is a function that is used to calculate the value of this property. The object of `responseRewrite` will eventually merge with the state in the Container.

You can use the `$output` variable to read the value of the interface.

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
            responseRewrite: {
                username: ({$output}) => $output.data.username
            }
        }
    ]}
/>
```