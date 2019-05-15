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
    dataProvider={[
        {
          mode: "ajax",
          namespace: "API1",
          config: {
            url: "/api1.json"
          }
        },
        {
          mode: "ajax",
          namespace: "API2",
          config: {
            url: "/api2.json"
          },
          requiredParams: ["API1", "API4"]
        },
        {
          mode: "ajax",
          namespace: "API3",
          config: {
            url: "/api3.json"
          },
          requiredParams: ["API1", "API2", "API4"]
        },
        {
          mode: "ajax",
          namespace: "API4",
          config: {
            url: "/api4.json"
          },
          requiredParams: []
        }
    ]}
/>
```

So if there are 4 interfaces, according to the above configuration, then the order of the interface requests will be 

```text
--> API 1---> API2 --> API3
|          |
|-- API 4 --
```

API1 and API4 will use Promise.all to call in parallel. Since API2 and API3 have pre-interface dependencies, they will be serial calls.

<iframe src="https://codesandbox.io/embed/1ymkr1x6vj?fontsize=14&view=editor" title="1ymkr1x6vj" style="width:100%; height:500px; border:0; border-radius: 4px; overflow:hidden;" sandbox="allow-modals allow-forms allow-popups allow-scripts allow-same-origin"></iframe>