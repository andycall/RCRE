import React from "react";
import ReactDOM from "react-dom";
import {RCREProvider, Container, ES, addEventListener} from 'rcre';

import "./styles.css";
import {Input} from "./components/Input";
import Todo from './components/Todo';

// Add redux middleware to log actions
addEventListener('RCRE_SET_DATA', (action) => {
    let name = action.payload.name;
    let value = action.payload.value;
    console.log('Container RCRE_SET_DATA action: name:' + name + ', value: ' + value);
});

const ShowMode = {
    ALL: 'all',
    ACTIVE: 'active',
    COMPLETE: 'complete'
};

let nextTodoId = 0;

function App() {
    return (
        <div>
            <RCREProvider>
                <Container
                    model={'test'}
                    data={{
                        todoList: []
                    }}
                >
                    <p>Todos</p>
                    <div>
                        <Input name={'newTodo'}/>
                        <ES>{({$data}, context) => {
                            return <button onClick={async (event) => {
                                if (!$data.newTodo) {
                                    return;
                                }

                                // Trigger a cross-container component pass-value task
                                // $this = the container to which the component belongs
                                await context.trigger.execTask('$this', {
                                    todoList: [
                                        ...$data.todoList,
                                        {
                                            text: $data.newTodo,
                                            completed: false,
                                            id: nextTodoId++
                                        }
                                    ],
                                    newTodo: ''
                                });
                            }}
                            >Add</button>;
                        }}</ES>
                    </div>

                    <ul>
                        <ES>{({$data}, context) => {
                            return $data.todoList.filter(i => {
                                switch ($data.mode) {
                                    case ShowMode.ALL:
                                        return i;
                                    case ShowMode.ACTIVE:
                                        return !i.completed;
                                    case ShowMode.COMPLETE:
                                        return i.completed;
                                    default:
                                        throw new Error('Unknown mode: ' + $data.mode)
                                }
                            }).map((list) => {
                                return (
                                    <Todo key={list.id}
                                          text={list.text}
                                          completed={list.completed}
                                          onClick={event =>
                                              context.container.$setData('todoList', $data.todoList.map(todo =>
                                                  (todo.id === list.id)
                                                      ? {...todo, completed: !todo.completed}
                                                      : todo
                                              ))
                                          }
                                    />
                                );
                            })
                        }}</ES>
                    </ul>

                    <ES
                        name={'mode'}
                        defaultValue={'all'}
                    >{({$value}, context) => (
                        <div>
                            <span>Show</span>
                            <button style={{marginLeft: '4px'}}
                                    disabled={$value === 'all'}
                                    onClick={event => context.container.$setData('mode', ShowMode.ALL)}
                            >All
                            </button>
                            <button style={{marginLeft: '4px'}}
                                    disabled={$value === 'active'}
                                    onClick={event => context.container.$setData('mode', ShowMode.ACTIVE)}
                            >Active
                            </button>
                            <button style={{marginLeft: '4px'}}
                                    disabled={$value === 'complete'}
                                    onClick={event => context.container.$setData('mode', ShowMode.COMPLETE)}
                            >Completed
                            </button>
                        </div>
                    )}</ES>
                </Container>
            </RCREProvider>
        </div>
    );
}

const rootElement = document.getElementById("root");
ReactDOM.render(<App/>, rootElement);
