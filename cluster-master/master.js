const express = require('express');
const bodyParser = require('body-parser');
const minimist = require('minimist');
const fs = require('fs');
const router = require('./src/router');
const processor = require('./src/processor');
const utility = require('./src/utility');

// parse process argv
const arg = minimist(process.argv.slice(2));
const port = arg.port;

if (port === undefined) {
    console.log('--port [number] argument not found');
    process.exit(1);
}

// load config worker
const WORKER_CONFIGURATION = './config/worker.json';
const workerConfig = ((f) => { return fs.existsSync(f) ? JSON.parse(fs.readFileSync(f).toString()) : undefined; })(WORKER_CONFIGURATION);

if (workerConfig == undefined) {
    console.log(`${WORKER_CONFIGURATION} file not found`);
    process.exit(1);
}

// connect to worker sockets
processor.initSocket(workerConfig);

// asynchronous infinite loop
processor.processQueue();

// Express
const app = express();
app.use('/task', bodyParser.json());
app.use('/task', router);

app.get('/', (request, response) => response.send('Cluster Network Master'));

// redirect
app.get('*', (request, response) => response.redirect('/'));

app.listen(port, () => console.log(`${utility.getTime()} : Listening on port ${port}`));
