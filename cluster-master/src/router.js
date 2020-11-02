const crypto = require('crypto');
const express = require('express');
const data = require('./data');

let counter = 1;
let router = express.Router();

router.post('/', (request, response) => {
    const inputJson = request.body;

    if (inputJson === undefined) response.status(400).send('Bad Request');

    let shaId = crypto.createHash('sha512')
        .update(`${(counter++)}`)
        .digest('hex');
    data.pendingTaskQueue.push([shaId, inputJson, response]);
});

module.exports = router;
