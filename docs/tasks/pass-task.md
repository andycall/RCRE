---
id: pass-task
title: The Pass Task
---

RCRE give you a build-in task to complete cross-container data assignment.

## Define a Pass Task

It's very easy to define a pass task.

```jsx harmony
<Container
    model={"demo"}
    task={{
        tasks: [{
            mode: 'pass', // declare it's an pass task
            name: 'passToDemo2', // your task's name, use trigger.execTask to execute
            config: {
                model: 'demo2', //  your target container model
                assign: { // Data to be passed to the target container
                    // $trigger is a param used to get the value of the event. 
                    // when you call trigger.execTask function, 
                    // you can use $trigger[TASK_NAME] get your param value.
                    username: ({$trigger}) => $trigger.passToDemo2.username
                }
            }
        }]
    }}    
/>
```

## Use a Pass Task

Use the `trigger.execTask` function provided by `<ES />` component to call your task.

```jsx harmony
<ES>{({$data}, {trigger}) => (
    <button
        onClick={event => {
            trigger.execTask('passToDemo2', {
                username: $data.username 
            });
        }}
    >click</button>
)}</ES>
```

## Demo

<iframe src="https://codesandbox.io/embed/github/andycall/RCRE/tree/master/examples/pass-tasks?fontsize=14" title="pass-task" style="width:100%; height:500px; border:0; border-radius: 4px; overflow:hidden;" sandbox="allow-modals allow-forms allow-popups allow-scripts allow-same-origin"></iframe>