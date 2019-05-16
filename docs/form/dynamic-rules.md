---
id: dynamic-rules
title: Dynamic Rules
---

You can use the `<RCREFormItem />` component the do the component validation. 

But form validation is not always static, it may be dynamic and is calculated based on the current state.

This section will describe how to deal with this situation, 

Here is an example:

```jsx harmony
<ES>
  {({ $data }) => (
    <RCREFormItem
      required={true}
      rules={[
        {
          maxLength: $data.max,
          message: "The max Length can not over " + $data.max
        }
      ]}
    >
      {({ valid, errmsg }, { $handleBlur }) => (
        <FormItem
          label="username"
          required={true}
          validateStatus={valid ? "success" : "error"}
          help={errmsg}
        >
          <ESInput name="username" onBlur={$handleBlur} />
        </FormItem>
      )}
    </RCREFormItem>
  )}
</ES>
```

In this example, we use the `<ES />` component to read the state in the Container and pass it to the validation rules of the FormItem, which forms a dynamic validation.

<iframe src="https://codesandbox.io/embed/gallant-meadow-606ck?fontsize=14" title="gallant-meadow-606ck" style="width:100%; height:500px; border:0; border-radius: 4px; overflow:hidden;" sandbox="allow-modals allow-forms allow-popups allow-scripts allow-same-origin"></iframe>

