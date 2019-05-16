---
id: handle-task-error
title: Handle Task Error
---

Tasks can cause errors, such as code exceptions and data errors. 

RCRE will output these errors to the console by default, but you can use the following code for custom error handling.

```javascript
import {Task} from 'rcre';

// write your custom error handler
Task.errorHandler = (error) => {
    console.error('ops, got an error', error);
};
```