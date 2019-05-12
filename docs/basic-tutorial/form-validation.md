---
id: automatic-form
title: Automatic Form
---

The more the number of forms, the more difficult it is to develop. 

Forms are definitely the most annoying part in the system. 

When functions become more and more complex, not only does it take a lot of time to add validation to each option, but it also needs to handles the linkage between multiple forms.

When the business logic is complex, the validation of the form is not only a regular expression, or it is required to be filled in.
 
There will be some complicated special scenarios, such as relying on an API for verification, some verification condition are comes from another components, make sure there will no excess data after multiple user interactions.

RCRE is designed to help you with these heavy tasks and enjoy a fast and easy coding experience.

## The &lt;Form /&gt; Component

To active the form validation, you need import the `<Form />` component.

Inside the Form component, you can use the FormItem component to create a validation area.
 
Inside the FormItem component, all components with the name attribute will be automatically listened to and will automatically trigger validation when the component is updated.

Let's see the example below:

<iframe src="https://codesandbox.io/embed/kxx03z8yzr?fontsize=14&view=preview" title="kxx03z8yzr" style="width:100%; height:500px; border:0; border-radius: 4px; overflow:hidden;" sandbox="allow-modals allow-forms allow-popups allow-scripts allow-same-origin"></iframe>

In this example, we use the Form component of antd to perform some UI presentations.

The children property of the Form and FormItem components is a function, through which you can get information related to form validation.

```jsx
<RCREForm
    onSubmit={(event, data) => {
      alert(`Submit data\n ${JSON.stringify(data, null, 2)}`);
    }}
>
    {({ $form, $handleSubmit }) => (
      <Form onSubmit={$handleSubmit}>
        
      </Form>
    )}
</RCREForm>
```

The `$form` variable provided by the Form component is the state of the entire form. You can use `$form.valid` to determine whether the current form is fully verified.

The Form component also provides `handleSubmit` function, when the form submission is triggered, you can use `$handleSubmit` as the onSubmit callback function of the Form component you are using.

## The &lt;FormItem /&gt; Component

The FormItem component is a component that controls a single validation area.
 
It detects all internal ES components with a name attribute and automatically triggers validation when the ES component is updated.

The child of FormItem is a function through which the current validation state can be obtained, as well as the onBlur callback.

If there are multiple components inside the FormItem with the name attribute, the update of any one component will trigger the verification. In fact, they share the same verification rule.

```jsx harmony
<RCREFormItem
  required={true}
  rules={[
    {
      maxLength: 10,
      message: "最大不超过10个字"
    }
  ]}
>
  {({ valid, errmsg, validating }, {$handleBlur}) => {
      
  }}
</RCREFormItem>
```