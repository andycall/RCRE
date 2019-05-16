---
id: custom-tasks
title: Custom Tasks
---

Any function can be a task, the only need is an simple configuration.

```jsx harmony
function sampleTask() {
    console.log('helloworld');
}

<Container
    model={"demo"}
    task={{
        tasks: [{
            name: 'sample',
            func: sampleTask
        }]
    }} 
/>
```

Then, you can use the `trigger.execTask` function from `<ES />` to trigger your task.

```jsx harmony
<ES>{({$data}, {trigger}) => (
    <button
        onClick={event => {
            trigger.execTask('sample', {
                username: $data.username 
            });
        }}
    >click</button>
)}</ES>
```

The second param of execTask is the params of your task, if you trigger an taskMap, all tasks from the taskMap will share the same params.

You can access your params in any task:

```jsx harmony
function sampleTask({params}) {
    console.log('this is the params of an button click', params); // { username: 'value from $data' }
}
```