---
id: overview
title: Overview
---

Everyone loves to use React to build apps, it's elegant and wonderful. But React does't tell you how to build a complex web application.

When an application becomes very complex, various issues arise, such as the state of the component, the relationship between the components, how to organize the API request, and how to handle form validation and submission. If you don't have a lot of experience to deal with these issues, your code will get worse and the bug will always be with you.

RCRE is a library that designed to make it easy for everyone to handle the above issues. It uses completely new design to make some complex problems easier. It has only a few React components, and you only need to known is write simple configuration and components to get everything done.

RCRE provide 5 powerful features that help you build your application right. 

1. Manage your component and application's state without writing action and reducers.
2. Manage your API and trigger them automatically based on your component's state.
3. Always keep your state immutable and not easy to break it.
4. State change trigger form validation automatically.
5. A task controller can help you separate complex user interactions into pure small tasks and assemble them with a simple config.

## Motivation

I ([@andycall](https://github.com/andycall)) wrote RCRE and created a large advertising system with two large and complex forms and hundreds of report pages. Soon we discovered that we were unable to use existing business development techniques to maintain harmonization, and we were unable to quickly complete our business needs. Therefore, it also needs to carry out some simplifications on the basis of the existing ones, standardize everyone's development methods and improve everyone's development efficiency.

## Why not RCRE ?

People use Redux to build the applications they want, but it's not enough to just known how to use Redux. You also need a series of Redux plugins such as redux-thunk, redux-sega and so on to do some complex functions.
 
Maybe learning some of these libraries can better understand Redux, but if you just want to get your job done quickly and have a good night with your girlfriend, you might want to try RCRE. It automatically helps you control Redux and manage your application state. You don't even need to learn how to use Redux! .

Maybe your daily job is to write Action, Reducer, and manually maintain your application state through line-by-line code. With RCRE, the state of the application is automatically mapped according to the structure of the component, and automatically updated according to the component's update, destruction, and mount. You don't need to write Action, Reducer anymore.

Maybe you used Redux-Thunk or Redux-Sega to manage your asynchronous requests. With RCRE, the interface can automatically initiate requests and synchronize to the state according to the parameter changes. You don't need to write a line related to the calling interface.
 
Maybe you used Redux-Form to synchronize the form state to State and write a lot of code to handle form validation. With RCRE, form validation will automatically trigger based on component changes and automatically synchronize all relevant information to the state. You don't need to write a line that triggers form validation. 
 
 
Maybe you have a hard time reusing a bunch of user interactive code. You must split existing code and may cause an error. With RCRE, each separate interactive logic code will be separated at the time of initial development, and when you want to reuse it, you only need one array to get everything done.

It can be seen that the use of RCRE for application development is still the concept of ​​Redux, but it is simpler, more portable to use, can effectively improve development efficiency. let programmers get off work early, no longer to be work like 996.
