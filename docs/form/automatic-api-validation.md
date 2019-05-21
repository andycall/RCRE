---
id: automatic-api-validation
title: Automatic API Validation
---

Verification can also be verified through the interface, using the apiRule attribute to do this.

```jsx harmony
<RCREFormItem
    required={true}
    apiRule={{
        url: "https://zdj1l.sse.codesandbox.io/getUserId",
        method: "GET",
        data: {
            // the query params
            user_name: ({ $args }) => $args.value
        },
        // an pattern to determine the query is correct
        validate: ({ $output }) => $output.errno === 0,
        // read errmsg from the API
        errmsg: ({ $output }) => $output.errmsg,
        // used to set value to Container State from validation API
        export: {
            user_id: ({ $output }) => $output.data.userId
        }
    }}
>
{({ valid, errmsg, validating }) => {
    return (
    <FormItem
        required={true}
        label="UserName:"
        hasFeedback={true}
        validateStatus={
        validating
            ? "validating"
            : valid
            ? "success"
            : "error"
        }
        help={errmsg}
        >
            <ESInput name="username" debounce={100} />
    </FormItem>
    );
}}
</RCREFormItem>
```

Online example:

<iframe src="https://codesandbox.io/embed/small-dawn-j4psm?fontsize=14" title="small-dawn-j4psm" style="width:100%; height:500px; border:0; border-radius: 4px; overflow:hidden;" sandbox="allow-modals allow-forms allow-popups allow-scripts allow-same-origin"></iframe>

