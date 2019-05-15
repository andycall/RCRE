---
id: api-loading-state
title: Use API Loading State
---

When the interface is triggered, RCRE will automatically update the current state of the interface. 

You can use the `$data.$loading` variable to determine if the current interface is calling.

If the interface call fails, you can use `$data.$error` to get the reason for the interface failure.

```jsx harmony
<Container
    model={"demo"}
    dataProvider={[{
        mode: 'ajax',
        namespace: 'API1',
        config: {
            url: '/example.com',
        }
    }]}
    <ES>{({$data}) => {
        if ($data.$loading) {
            return <div>loading...</div>;
        }
        
        if ($data.$error) {
            return <div style={{color: 'red'}}>Request failed: {$data.$error.message}</div>
        }
        
        return <div>loading success</div>
    }}</ES>
/>
```