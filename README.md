![](https://user-images.githubusercontent.com/4409743/56594977-5c989180-6620-11e9-8a52-33f399294579.png)

[![CircleCI](https://circleci.com/gh/andycall/RCRE.svg?style=svg)](https://circleci.com/gh/andycall/RCRE)
[![Stable Release](https://img.shields.io/npm/v/rcre.svg)](https://npm.im/rcre)
[![gzip size](http://img.badgesize.io/https://unpkg.com/rcre@latest/dist/index.js?compression=gzip)](https://unpkg.com/rcre@latest/dist/index.js)
[![license](https://badgen.now.sh/badge/license/MIT)](./LICENSE)
[![coverage](https://img.shields.io/codecov/c/github/andycall/RCRE/master.svg)](https://img.shields.io/codecov/c/github/andycall/RCRE/master.svg)

## What is RCRE?

Everyone loves to use React to build apps, it's elegant and wonderful. But React does't tell you how to build **a complex web application**. 

When an application becomes very complex, various issues arise, such as the state of the component, the relationship between the components, the state of the entire application, how to organize the API request, and how to handle form validation and submission. If you don't have a lot of experience to deal with these issues, your code will get worse and the bug will always be with you.

If you've ever read some of the large react project codes, you'll find it hard to figure out how it works. Obviously, not everyone can handle the above problems very well.

RCRE is designed to make it easy for **everyone** to handle the above issues. It uses completely new design to make some complex problems easier. It has only a few React components, and you only need to known is write simple configuration and components to get everything done. 

RCRE provide 6 powerful features that help you build your application right. 

1. Manage your component and application's state without writing action and reducers.
2. Manage your API and trigger them automatically based on your component's state.
3. Always keep your state immutable and not easy to break it.
4. State change trigger form validation automatically.
5. Use syntax checker to prevent developer to write complex computing code embed into JSX code to make your template code more readable.
6. A task controller can help you separate complex user interactions into pure small tasks and assemble them with a simple config.


## Docs (working in progress)

+ Getting Started
+ API Reference
+ Article / Tutorials
+ Sliders
+ Get Help

## In-browser Playgrounds

You can play with RCRE in your web browser with these live online playgrounds.

+ CodeSandbox 

## Examples

+ Basics
    + Use Container Component
    + Use ES Component
+ Container
    + use init data
    + sync value between parent and child container
    + delete value when container destroyed 
+ Work with Exist React application
    + work with react-router
    + work with redux
    + work with any React Component libraries.
+ Work with API
    + Call the API
    + update the API with component update
    + serial API call
    + parallel API call
    + custom API call conditions
+ Events
    + Handle a click event
    + send value to this container
    + send value to parent container
    + send value to target container
    + how to bypass react events into RCRE
+ Tasks
    + how to define tasks
    + how to assemble multi tasks
    + one event to trigger multi tasks
    + how to use pure function to write a task
    + how to use the task map
    + how to get value from every task
    + how to handle error tasks
    + how to handle async task
+ Forms 
    + sync validation
    + async validation
    + custom validation
    + how to trigger form submission
    + the disabled property
    + the required property
    + the rules property
    + pass form state to component  
+ Dynamic
    + dynamic names
    + dynamic container
    + dynamic form validations
    + dynamic event handler
    
    
## Authors

+ andycall [@andycall](http://github.com/andycall)


## LICENSE
MIT
