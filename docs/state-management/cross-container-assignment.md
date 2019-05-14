---
id: cross-container-assignment
title: Cross Container Assignment
---

You can use the built-in pass task to pass data to another Container component.

<iframe src="https://codesandbox.io/embed/github/andycall/RCRE/tree/master/examples/pass-tasks?fontsize=14&view=preview" title="pass-task" style="width:100%; height:500px; border:0; border-radius: 4px; overflow:hidden;" sandbox="allow-modals allow-forms allow-popups allow-scripts allow-same-origin"></iframe>

## Container Build-In Pass Task

The Container component will have 2 built-in pass tasks.

1. $this
2. $parent

### The $this task

The $this task refers to the Container component attached to the current component, so in the event callback, you can use `trigger.execTask('$this', {})` to pass the value to the current Container component.

```jsx harmony
<ES>{({$data}, context) => (
    <button onClick={event => context.trigger.execTask('$this', {
      username: ({$data}) => $data.username
    })}>send username to demo2</button>
)}</ES>
```

### The $parent task

The $parent task refers to the parent Container component of the Container component attached to the current component, so in the event callback, you can use `trigger.execTask('$parent', {})` to pass the value to the parent Container Component.

```jsx harmony
<ES>{({$data}, context) => (
    <button onClick={event => context.trigger.execTask('$parent', {
      username: ({$data}) => $data.username
    })}>send username to demo2</button>
)}</ES>
```