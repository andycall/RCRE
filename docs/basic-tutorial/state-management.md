---
id: state-management
title: State Management
---

RCRE is designed to manage complex application state with ease. 

Unlike other libraries that help you write `actions and reducers` better, RCRE is designed to let you manage your application state without any `action and reducers`. 

This sounds ridiculous, how can you manage your application state without any `action or reducers` and trigger them in your components? That's the first difference between RCRE and other state management libraries.

## State is the mirror of component

When you build your application with components, you already define the structure of you applications. 



## The &lt;Container /&gt; Component

Application state structure can be the mirror of your component's structure. 

If you already know your current component structure, then you can directly infer the data structure within the state. 

If your component structure changes in the future, such as some of the user's operations hide some components, then your state structure will automatically follow the changes, just like the relationships between Virtual DOM and DOM. 

