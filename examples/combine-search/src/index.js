import React from "react";
import ReactDOM from "react-dom";
import {RCREProvider, Container, ES, DataCustomer} from 'rcre';
import {Col, Row, Table} from 'antd';

import 'antd/dist/antd.css';

import "./styles.css";
import {GET_REPO_LIST, RepoSortOptions, TypeSortOptions} from "./constant";
import {ESInput} from "./Components/Input";
import {ESSelect} from "./Components/Select";

DataCustomer.errorHandler = (error) => {
  console.error('request failed', error);
};

const TableColumns = [{
  title: 'id',
  key: 'id',
  dataIndex: 'id'
}, {
  title: 'name',
  key: 'name',
  dataIndex: 'name'
}, {
  title: 'star',
  key: 'star',
  dataIndex: 'stargazers_count'
}, {
  title: 'forks',
  key: 'forks',
  dataIndex: 'forks_count'
}, {
  title: 'created_at',
  key: 'created_at',
  dataIndex: 'created_at'
}, {
  title: 'updated_at',
  key: 'updated_at',
  dataIndex: 'updated_at'
}, {
  title: 'push_at',
  key: 'push_at',
  dataIndex: 'push_at'
}];

function App() {
  return (
    <div>
      <RCREProvider>
        <Container
          model={'test'}
          data={{
            repoList: []
          }}
          dataProvider={[{
            mode: 'ajax',
            namespace: GET_REPO_LIST,
            config: {
              url: ({$data}) => `https://api.github.com/users/${$data.username}/repos`,
              data: {
                sort: ({$data}) => $data.sort,
                type: ({$data}) => $data.type
              }
            },
            requiredParams: ['username'],
            responseRewrite: {
              repoList: ({$output}) => $output
            }
          }]}
        >
          <p>Github User Profile</p>
          <Row>
            <Col span={3}><div>Github UserName: </div></Col>
            <Col span={4}>
              <ESInput name={'username'} />
            </Col>
            <Col span={4}>
              <span>Sort: </span>
              <ESSelect name={'sort'} defaultValue={'full_name'} options={RepoSortOptions} />
            </Col>
            <Col span={4} >
              <span>Type: </span>
              <ESSelect name={'type'} defaultValue={'owner'} options={TypeSortOptions} />
            </Col>
          </Row>
          <Row>
            <ES>{({$data}, context) => (
              <Table
                loading={$data.$loading}
                rowKey={'id'}
                columns={TableColumns}
                dataSource={$data.repoList || []}
              />
            )}</ES>
          </Row>
        </Container>
      </RCREProvider>
    </div>
  );
}

const rootElement = document.getElementById("root");
ReactDOM.render(<App/>, rootElement);
