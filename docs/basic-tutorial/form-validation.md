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

