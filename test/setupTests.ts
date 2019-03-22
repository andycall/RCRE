import {configure} from 'enzyme';
import Adapter from 'enzyme-adapter-react-16';
import express from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';
import path from 'path';

const app = express();
app.use('/static', express.static(path.join(__dirname, './__mock__/data')));

app.use(cors());
app.use(bodyParser.json());

// // catch 404 and forward to error handler
app.use((req, res, next) => {
    let err = new Error('Not Found');
    res.status(404);
    next(err);
});

console.log('server listening at 0.0.0.0:' + (process.env.PORT || 8844));
let server = app.listen(process.env.PORT || 8844);

configure({
    adapter: new Adapter()
});

afterAll(() => {
    server.close();
});
