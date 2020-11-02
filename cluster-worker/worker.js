const minimist = require('minimist');
const socketServer = require('./src/socket-server');


// parse process argv
const arg = minimist(process.argv.slice(2));
const port = arg.port;
const password = arg.password;

if (port === undefined) {
    console.log('--port [number] argument not found')
    process.exit(1);
}

if (password === undefined) {
    console.log('--password [worker password] argument not found')
    process.exit(1);
}

socketServer.initSocketServer(port, password);
