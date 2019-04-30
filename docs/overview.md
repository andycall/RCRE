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

Vue is easy to use, everyone likes to directly modify the data view automatic update experience, but after the project becomes bigger, such a design will bring a lot of trouble.
 
React is difficult to get started, but when the project is big, you will gradually realize the advantages of one-way data flow and immutable data change. 

My goal is to combine the advantages of vue and react to maximize the technical advantage of react with lower learning and usage costs.

## Installation
You can install Formik with NPM, Yarn.

### NPM

```sh
npm install rcre --save
```
or
```
yarn add rcre
```

RCRE is compatible with React v15+ and works with ReactDOM and React Native.

### CDN

// TODO

### In-browser Playgrounds

You can play with RCRE in your web browser with these live online playgrounds.

* CodeSandbox (ReactDOM) https://codesandbox.io/s/pywlq1vqq0

