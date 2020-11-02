const socketIO = require('socket.io');
const utility = require('./utility');

function initSocketServer(port, password) {
    console.log(`${utility.getTime()} : Starting socket server on port ${port}`);
    socketIO.listen(port).on('connection', (socket) => {
        
        socket.emit('response', { 'command': 'connected' }); // send connection established
        socket.emit('response', { 'command': 'job', 'state': 'valid' });
        healthCheckStatus(socket).then(); // send server ping all 1 time

        socket.on('request', (request) => {// hook requests
            if(request.password === password) {
                console.log(`${utility.getTime()} : ${'Job Start '.padEnd(13)}${request.code}`);

                // lock instance
                socket.emit('response', { 'command': 'job', 'state': 'invalid' });

                // working
                socket.emit('response', { 'command': 'result', 'id': request.id, 'result': `${JSON.stringify(request.message).toString()}` });

                // unlock instance
                socket.emit('response', { 'command': 'job', 'state': 'valid' });
            } else socket.disconnect();
        });
    });
}

async function healthCheckStatus(socket) {
    while(true) {
        if(socket.connected) {
            socket.emit('response', { 'command': 'ping', 'time': Date.now(), 'status': 'OK' });
            console.log(`${utility.getTime()} : Reported to master`);
            await utility.sleep(1000 * 60); // 1 minute
        } else break; // stop when socket disconnected
    }
}

module.exports = {
    initSocketServer
};
