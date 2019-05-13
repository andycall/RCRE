---
id: state-auto-recycle
title: State Auto Recycle
---

Inside the form, when the component is destroyed, the state of the component can be automatically recycled.

If your component is not inside the form, you can use the `clearWhenDestroy` property to automatically clean up the data when the component is destroyed.

In other cases, the destruction of the component does not trigger the clearing of the value.


<iframe src="https://codesandbox.io/embed/wn0978ywjl?fontsize=14&view=preview" title="wn0978ywjl" style="width:100%; height:500px; border:0; border-radius: 4px; overflow:hidden;" sandbox="allow-modals allow-forms allow-popups allow-scripts allow-same-origin"></iframe>