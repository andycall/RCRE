---
id: sync-data-between-multi-container
title: Sync Data Between Multi Container
---

Multiple container components are independent of each other by default.

If you want to be able to keep data synchronized automatically between Containers, you can use the props and export properties on the Container component.

Container data synchronization is limited to the parent-child relationship between Containers, that is, the parent can synchronize data to the child, and the child can synchronize data to the parent. 

If you just want to send data to a peer or cross-level Container component by event, please read the [Cross Container Assignment](./cross-container-assignment)

## Sync data To Child

You can use the props property to pass the value of the parent to the child. 

Each property is an anonymous function. Use the `$parent` variable to get the value of the parent Container.

<iframe src="https://codesandbox.io/embed/kw48kzwxz3?fontsize=14&view=editor" title="kw48kzwxz3" style="width:100%; height:500px; border:0; border-radius: 4px; overflow:hidden;" sandbox="allow-modals allow-forms allow-popups allow-scripts allow-same-origin"></iframe>

## Sync data To Parent

By adding the export attribute on the child Container, you can automatically synchronize the value to the parent Container.

As same as the props attribute, the export attribute is also an object. 

Each attribute value is an anonymous function, Use the `$data` variable to get the value of the child Container.

<iframe src="https://codesandbox.io/embed/qlr7wojy44?fontsize=14&view=editor" title="qlr7wojy44" style="width:100%; height:500px; border:0; border-radius: 4px; overflow:hidden;" sandbox="allow-modals allow-forms allow-popups allow-scripts allow-same-origin"></iframe>

## Two way binding between Child and Parent

If you use props and export at the same time, the parent container and the child container form a two-way binding relationship, and any component update will trigger another component update.

<iframe src="https://codesandbox.io/embed/54y55my2v4?fontsize=14" title="54y55my2v4" style="width:100%; height:500px; border:0; border-radius: 4px; overflow:hidden;" sandbox="allow-modals allow-forms allow-popups allow-scripts allow-same-origin"></iframe>

## When and Where to Use This Feature

When you use this function, the Container and Container will be automatically synchronized.
 
That is to say, any changes to the state will case Container component and all child components to be update. It will not only trigger the re-rendering of the components in the current Container, but also trigger all Container components which it dependencies.

So before you use this feature, it's best to think about whether you need this feature.

**When do you need to use this feature?**

1. You need to share data between multiple Container components
2. There are a large number of components in your Container that are dependent on other Containers 
3. You need to use the DataProvider in a certain area. The data of this interface is only used in the current Container
4. Some tasks are limited to specific areas and are not shared by other features

**When should you not use this feature?**

1. The data comes from an event, you need to pass this data directly to a Container component
2. Scenes that can be replaced by a single Container
