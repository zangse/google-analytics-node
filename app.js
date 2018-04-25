'use strict';
import express from 'express';
import { hostConfig } from './app/config/index';
import path from 'path';
import router from './app/routes/index';
import bodyParser from 'body-parser';
const app = express()
app.use(bodyParser.urlencoded({
    extended: true
}));
app.use(bodyParser.json());

router(app);
app.listen(hostConfig.port);
console.log(hostConfig.port);