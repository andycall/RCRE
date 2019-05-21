---
id: custom-validation
title: Custom Validation
---

Business logic is changeable, you can't do all the functions with built-in validation, so you can implement custom validation by using a function.

You can do this using the `validation` property of the RCREFormItem component.

```jsx harmony
<RCREFormItem
    required={true}
    validation={({ $args }) => {
        // use $args.value to access 
        if ($args.value !== "123456") {
            return {
                isValid: false,
                errmsg: "data should equal to 123456"
            };
        }
        return {
            isValid: true,
            errmsg: ""
        };
    }}
>
    {({ valid, errmsg }) => (
        <FormItem
            required={true}
            label="UserName:"
            validateStatus={valid ? "success" : "error"}
            help={errmsg}
        >
            <ESInput name="username" />
        </FormItem>
    )}
</RCREFormItem>
```

Within the validation function, you can use the `$data` variable to access Container's data.

Online example:
<iframe src="https://codesandbox.io/embed/summer-sunset-pvtdc?fontsize=14" title="summer-sunset-pvtdc" style="width:100%; height:500px; border:0; border-radius: 4px; overflow:hidden;" sandbox="allow-modals allow-forms allow-popups allow-scripts allow-same-origin"></iframe>

