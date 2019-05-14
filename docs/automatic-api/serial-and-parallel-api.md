---
id: serial-and-parallel-api
title: Serial And Parallel Request
---

If you need to call multiple interfaces on a Container component, you can do this by adding multiple interface configurations to the DataProvider property.

RCRE will automatically help you analyze the dependency of each interface on the data and generate a request queue. 

In the queue, those interfaces that do not have pre-dependencies will be ranked first, while those that depend on other interfaces will be placed behind the interfaces that are dependent. 

So you don't need to know how to call them, just provide the calling conditions for each interface.


```jsx harmony
<Container
    model={"demo"}
    dataProvider={[{
        mode: 'ajax',
        namespace: 'API 1',
        config: {} 
    }, {
       mode: 'ajax',
       namespace: 'API 2',
       config: {},
       requiredParams: ['API 1'] 
    }, {
       mode: 'ajax',
       namespace: 'API 3',
       config: {},
       requiredParams: ['API 1', 'API 2']
    }, {
       mode: 'ajax',
       namespace: 'API 3',
       config: {},
       requiredParams: []        
    }]}
/>
```

So if there are 4 interfaces, according to the above configuration, then the order of the interface requests will be 

```text
--> API 1---> API2 --> API3
|          |
|-- API 4 --
```

API1 and API4 will use Promise.all to call in parallel. Since API2 and API3 have pre-interface dependencies, they will be serial calls.