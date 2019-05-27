---

The state management of RCRE is based on Redux, so it can be 100% compatible with other Redux usages.

## combine RCRE's reducer

RCRE has exposed all the built-in reducers, you just need to integrate it with your existing via `combineReducer`.

Here is an example integrate RCRE's reducer with other reducers.

```jsx harmony
import { combineReducers } from "redux";
import todos from "./todos";
import visibilityFilter from "./visibilityFilter";
import { rcreReducer } from "rcre";

export default combineReducers({
  todos,
  visibilityFilter,
  $rcre: rcreReducer
});
```

## How this works

When you combine the RCRE's reducer with the reducer in your current application, all the data and state of the RCRE will only update the object pointed to by the $rcre key, without any impact on your existing data. 

You can safely integrate RCRE with your existing React application without worrying about some conflicts between them.