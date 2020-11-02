const socketClient = require('socket.io-client');
const data = require('./data');
const { getTime, sleep } = require('./utility');

const initSocket = (workerConfig) => {
    console.log(`${getTime()} : Initializing socket connection`);
    for (let i = 0; i < workerConfig.length; i++) {
        let client = socketClient.connect(workerConfig[i].uri, { reconnect: true, forceNew: true });
        data.workerList.push([client, workerConfig[i].password]);
        data.workerStatus.push(false);
        data.workerList[i][0].on('response', function (response) {
            if (response.command === 'result') { // when result came (first condition)
                let currentJobId = response.id;
                console.log(`${getTime()} : ${'Job Received'.padEnd(15)}${`from Worker ${i}`.padEnd(8)}${currentJobId}`);
                let result = response.result;

                //console.log(result); // debug mode
                
                let currentJob = data.workingTaskData[currentJobId];
                // send response to api request
                let apiResponse = currentJob[1];
                apiResponse.send(result);
                // delete finished job
                delete data.workingTaskData[currentJobId];
            } else if (response.command === 'ping') { // when ping came
                if (response.status === 'OK') {
                    console.log(`${getTime()} : Status received from Worker ${i} : Ping ${Date.now() - response.time}`);
                }
            } else if (response.command === 'connected') { // when connected
                console.log(`${getTime()} : Connected to socket server of Worker ${i}`);
                // call spawn worker function for preloading
                //data.workerList[i][0].emit('request', { 'command': 'spawn', 'password': data.workerList[i][1] });
            } else if (response.command === 'job') { // when job state updated
                if (response.state === 'invalid') data.workerStatus[i] = false;
                else if (response.state === 'valid') data.workerStatus[i] = true;
            }
        });
    }
};

const processQueue = async () => {
    while (true) {
        if (data.pendingTaskQueue.length !== 0) {
            let done = false;
            let currentJob = data.pendingTaskQueue[0];// select head of queue
            let currentJobId = currentJob[0];
            let currentMessage = currentJob[1];
            let currentResponse = currentJob[2];
            data.pendingTaskQueue.shift();
            data.workingTaskData[currentJobId] = [currentMessage, currentResponse];

            while (true) {
                if (done) break;
                for (let i = 0; i < data.workerList.length; i++) {// select available worker
                    if (data.workerStatus[i]) {
                        console.log(`${getTime()} : ${'Job Sent'.padEnd(15)}${`to Worker ${i}`.padEnd(8)}${currentJobId}`);

                        //console.log(currentMessage); // debug mode

                        data.workerList[i][0].emit('request', { 'password': data.workerList[i][1], 'id': currentJobId, 'message': currentMessage });
                        data.workerStatus[i] = false;
                        done = true;
                        break;
                    }
                }
                await sleep(5); // if all workers work
            }
        }
        if (data.pendingTaskQueue.length === 0) await sleep(10); // if queue is empty
    }
};

module.exports = {
    initSocket,
    processQueue
};
