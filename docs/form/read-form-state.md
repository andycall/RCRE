---
id: read-form-state
title: Read Form State
---

The `$form` variable of the RCREForm component is the state of the current entire form.

You can use the `$form.valid` variable to get the overall validation status of the current form. When all the RCREFormItem components in the form have been validated, `$form.valid` will become true.

<iframe src="https://codesandbox.io/embed/bitter-forest-q4njm?fontsize=14" title="bitter-forest-q4njm" style="width:100%; height:500px; border:0; border-radius: 4px; overflow:hidden;" sandbox="allow-modals allow-forms allow-popups allow-scripts allow-same-origin"></iframe>