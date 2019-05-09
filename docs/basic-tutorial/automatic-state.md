---
id: automatic-state
title: Automatic State
---

We use components to build our applications. If the application needs some user interactions, we put data into the store and use actions and props to communicate between components and store.

If the application grows complex and bigger, our store became complex too. If you don't have a good state division and structural design as the beginning, you will spend a lot of time making up for the mistakes you made in the past.

If you are in a team that everyone use react and redux to build applications. Everyone have their personal taste of state design and there is no tools to limit user to design their state. Hundreds of pages cannot have the same state structure design, and each page has its own state structure, which plagues the entire team's development efficiency.

You need RCRE to control your application's state and keep every page's state look like the same.

## The &lt;Container /&gt; Component

Container component can let state always be sync with your components.

In the example below, we import `<RCREProvider/>`, `<ES />`, `<Container />` components and use them inside of a react components.   

The `<RCREProvider />` component will create an redux store for you and create context for `<Container />` and `<ES />` components.

The `<Container />` component will read redux store and map your state value based on `model` property.

The `<ES />` component is used to read or set the Container state. Its children property must be a function, the function will always have two parameters, the following example uses the first parameter to read the value of the Container component.

The following example will read the status of the Container and print it on the screen.

<iframe src="https://codesandbox.io/embed/505z4w3ww4?fontsize=14&view=editor" title="505z4w3ww4" style="width:100%; height:500px; border:0; border-radius: 4px; overflow:hidden;" sandbox="allow-modals allow-forms allow-popups allow-scripts allow-same-origin"></iframe>

## Use &lt;ES /&gt; to update state

The `<ES />` not only can read the state from Container component, but also can set value to it. 

When want to update your state, you need the second params from `<ES />` components.

In the example below, we create an Input component with `<ES />` and accept a name property. `<ES />` will use the name as key of the container value.  

Here is an example:

<iframe src="https://codesandbox.io/embed/xoq6pokx5w?autoresize=1&fontsize=14&view=editor" title="xoq6pokx5w" style="width:100%; height:500px; border:0; border-radius: 4px; overflow:hidden;" sandbox="allow-modals allow-forms allow-popups allow-scripts allow-same-origin"></iframe>


## See your state with Redux DevTools
RCRE use Redux to manage your state, so the official redux devtools still can be used to inspect state or time travel to previous state.

Click the link below and open your redux devtools to see your application state
 
https://xoq6pokx5w.codesandbox.io/