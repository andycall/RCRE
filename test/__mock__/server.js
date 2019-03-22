/**
 * @file 测试代理服务器
 * @author dongtiancheng@baidu.com
 */

const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const path = require('path');

process.on('disconnect', () => {
    process.exit(0);
});

const app = express();
app.use('/static', express.static(path.join(__dirname, './data')));

app.use(cors());
app.use(bodyParser.json());

// // catch 404 and forward to error handler
app.use((req, res, next) => {
    let err = new Error('Not Found');
    res.status(404);
    next(err);
});

console.log('server listening at 0.0.0.0:' + (process.env.PORT || 8844));
app.listen(process.env.PORT || 8844);
