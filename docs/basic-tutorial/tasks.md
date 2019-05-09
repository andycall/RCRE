---
id: tasks
title: Tasks
---

In react apps, we use callback to handle user interactions. This can easily handle some simple scenarios, such as popping up a prompt. But when user interactions became complex, callback function will become complex and hard to read and unmaintainable.

The task is designed to split your complex user interactions and keep every task organized.

A task is not a component or function, just a property of a Container component. Simply define your task configuration on the Container component and use them in the container component.

Here is an example:

<iframe src="https://codesandbox.io/embed/my4v878wkx?fontsize=14&view=preview" title="my4v878wkx" style="width:100%; height:500px; border:0; border-radius: 4px; overflow:hidden;" sandbox="allow-modals allow-forms allow-popups allow-scripts allow-same-origin"></iframe>

If you click the submit button, the page pops up a confirmation box. If you click OK, the page will output the submitted value in the console after 1s and a prompt will pop up.

So with a button click, there will be the following business logic

```text
Click --> Validate --> Confirm --> Submit --> Notice 
```

This is a serial call logic. If you use a piece of code to write it, and don't always remember to split the different logic into separate functions, the code will become as incomprehensible as the following.

```javascript
function handleClick(params) {
    if (params.username !== "andycall") {
    throw new Error("You are not andycall!");
  }

  if (params.password !== "123456") {
    throw new Error("incorect password!");
  }
  
  Modal.confirm({
    title: "确认提交吗?",
    content: (
      <div>
        <div>
          <span>UserName: </span>
          <span>{params.username}</span>
        </div>
        <div>
          <span>PassWord: </span>
          <span>{params.password}</span>
        </div>
      </div>
    ),
    onOk: () => {
      setTimeout(() => {
        console.log("username", params.username);
        console.log("password", params.password);
        message.info("UserName:" + params.username);
      }, 1000);
    },
    onCancel: () => {}
  }); 
}
```

Codes of different functions are mixed together, causing great confusion for code reuse.

## Use the `task` Property

If you look at the code for the example above, you will notice that there is such a configuration on the Container component.

```jsx
import { confirmTask } from "./tasks/confirm";
import { validateTask } from "./tasks/validate";
import { requestTask } from "./tasks/request";
import { noticeTask } from "./tasks/notice";

<Container 
  task={{
    tasks: [
      {
        name: "validate",
        func: validateTask
      },
      {
        name: "confirm",
        func: confirmTask
      },
      {
        name: "request",
        func: requestTask
      },
      {
        name: "notice",
        func: noticeTask
      },
      {
        name: "reset",
        mode: "pass",
        config: {
          model: "demo",
          assign: {
            username: "",
            password: ""
          }
        }
      }
    ],
    taskMap: [
      {
        name: "confirmToSubmit",
        steps: ["validate", "confirm", "request", "notice"]
      }
    ]
  }}
/>
```

We use the tasks property to define five different operational tasks, each with a name attribute and its corresponding function. 

This function can be either a normal function or a built-in function of RCRE. If you set the mode to "pass", you can assign a value to a Container component.

With these 5 separate tasks, you can use an array to combine them and give this component a name.

## Execute task

In this way, we have an interactive set of five tasks, which can be called inside the Container component using the execTask function provided by the ES component.

```jsx
 <ES>{({ $data }, { trigger }) => (
  <button
    onClick={event =>
      trigger.execTask("confirmToSubmit", {
        username: $data.username,
        password: $data.password
      })
    }
  >
    Submit
  </button>
)}
</ES>
```