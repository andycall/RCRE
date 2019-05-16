---
id: custom-validation
title: Custom Validation
---

Business logic is changeable, you can't do all the functions with built-in validation, so you can implement custom validation by using a function.

You can do this using the two properties of the RCREFormItem component.

1. filterRule, a pure function to return true or false the determine validation is correct 
2. filterErrMsg, a pure function to get the error message when invalid.

Here is an example:



