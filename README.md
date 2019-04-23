![](https://user-images.githubusercontent.com/4409743/56588853-c1e78500-6616-11e9-814f-8d6bfc8917d9.png)

[![CircleCI](https://circleci.com/gh/andycall/RCRE.svg?style=svg)](https://circleci.com/gh/andycall/RCRE)
[![Stable Release](https://img.shields.io/npm/v/rcre.svg)](https://npm.im/rcre)
[![gzip size](http://img.badgesize.io/https://unpkg.com/rcre@latest/dist/index.js?compression=gzip)](https://unpkg.com/rcre@latest/dist/index.js)
[![license](https://badgen.now.sh/badge/license/MIT)](./LICENSE)
[![coverage](https://img.shields.io/codecov/c/github/andycall/RCRE/master.svg)](https://img.shields.io/codecov/c/github/andycall/RCRE/master.svg)

## What is RCRE?

Everyone loves to use React to build apps, it's elegant and wonderful. But React does't tell you how to build a complex web application. When the application becomes very complicated, various problems such as the state of the component, the relationship between the components, the state of the entire application, how to organization your API request, and how to handle form validation and submissions. If you've ever read some of the large react project codes, you'll find it hard to figure out how it works. Obviously, not everyone can handle the above problems very well.

RCRE is designed to make it easy for **everyone** to handle the above issues. It uses completely new design to make some complex problems easier. It has only a few React components, and you only need to write some simple configuration to get everything working. From now on, there will be **no action and reducer**, and no need to write some lifecycle methods such as componentDidUpdate. All your API request are managed in place and can be triggered automatically based on the state of the component. The form can automatically trigger validate based on the state of the component. All your application's state are immutable, and you can use any of the react components to trigger event callbacks and synchronize component data.

RCRE provide powerful features that help you with the 5 most annoying parts:

1. manage your component and application's state
2. manage your API and how to trigger them
3. how to keep your state immutable and not easy to break it.
4. how to handle form validation, submission and keep everything in state.
5. how to separate your computing code and jsx code and make code more readable.