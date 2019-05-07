---
id: automatic-api
title: Automatic API
---

We use ajax to request the backend interface to get the data. 

There are many application scenarios that require the use of a backend interface. When we want to trigger an API, we wrote such codes below:

```javascript
import axios from 'axios';

function callAnAPI(data) {
    return axios({
        url: '/example',
        method: 'GET',
        data: data
    });
}

callAnAPI({
    username: 'helloworld'
});
```

We just call it when we need it, that's very simple. But when your application is complex, there will be many of API calls. 

Things get bad when you need to trigger an API in parallel or have more than a dozen components, and any component update must trigger the same API repeatedly.

RCRE provider you an automatic API system that can trigger you API when needs. The only things you need to think is every API's params and trigger conditions.  

## The dataProvider property
The automatic API system is integrated on the Container component. Just add the dataProvider property and have fun with APIs.

Let's update the previous example and add dataProvider property.

<iframe src="https://codesandbox.io/embed/6203m5q09z?fontsize=14&view=editor" title="6203m5q09z" style="width:100%; height:500px; border:0; border-radius: 4px; overflow:hidden;" sandbox="allow-modals allow-forms allow-popups allow-scripts allow-same-origin"></iframe>

In this example, we add an dataProvider property to trigger an API call. 

```javascript
[{
  mode: "ajax",
  namespace: GITHUB_USER,
  config: {
    url: ({ $data }) =>
      "https://api.github.com/users/" + $data.username,
    method: "GET"
  }
}]
```

the namespace is the name of this API, RCRE use this name to keep track of every APIS. 

Every property under config property can be dynamic property. Use anonymous function to replace pure value to trigger recalculated when call this API, so you can read container state at this moment and return the newest value.

Every time when you update the input components, value will be sync to container and trigger dataProvider's API automatically. Every API will use the config property to compare with previous config to filter request which have the same params.

After the API is finished, the request value will pass to store and update to your `$data` property, so you can access them via `$data[namespace]`.