---
id: container-init-value
title: Container Init Value
---

The Container component can use the `data` attribute to give the component initial value.

```jsx harmony
<Container 
    model="demo"
    data={{
        name: 'helloworld'
    }}
/>
```

After all component is initialized, the state:
```json
{
    "demo": {
        "name": "helloworld"
    }
}
```

If the name value of the component is the same as the key of the initialization value, the component will also get the initial value at initialization time.

<iframe src="https://codesandbox.io/embed/8lw34678o0?fontsize=14&view=editor" title="8lw34678o0" style="width:100%; height:500px; border:0; border-radius: 4px; overflow:hidden;" sandbox="allow-modals allow-forms allow-popups allow-scripts allow-same-origin"></iframe>

## Dynamic initialization

Each value in the data property can be an anonymous function. 

This anonymous function is not passed to the component as a normal function. Instead, it is executed after the component is initialized, and the return value of the function is taken as the initial state of the component.

```jsx harmony
<Container
    model="demo"
    data={{
        other: 'other value',
        name: ({$data}) => 'helloworld ' + $data.other
    }}
/>
```

After all component is initialized, the state:
```json
{
    "demo": {
        "other": "other value",
        "name": "helloworld other value"
    }
}
```
