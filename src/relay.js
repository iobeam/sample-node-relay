"use strict";
const iobeam = require("iobeam-client");

const DEFAULT_BATCH_SIZE = 3;

class Relay {
    constructor(projectId, projectToken, batchSize) {
        this.projectId = projectId;
        this.token = projectToken;
        this.clients = new Map();
        if (typeof(batchSize) === "undefined" || batchSize === null) {
            this.batchSize = DEFAULT_BATCH_SIZE;
        } else {
            this.batchSize = batchSize;
        }
    }

    addData(deviceId, dataset) {
        if (!this.clients.has(deviceId)) {
            let temp;
            // Assumes error is duplicate, so set ID.
            const regCb = (success, device) => {
                if (!success) {
                    temp.setDeviceId(deviceId);
                }
            };
            const deviceSpec = {deviceId: deviceId};
            temp = iobeam.Builder(this.projectId, this.token)
                            .register(deviceSpec, regCb)
                            .build();
            this.clients.set(deviceId, temp);
        }

        const client = this.clients.get(deviceId);
        console.log("add dataset...");
        for (let k in dataset) {
            const arr = dataset[k];
            arr.forEach( (e) => {
                client.addDataPoint(k, e);
            });
        }
        let size = 0;
        for (let k in client.dataset()) {
            size += dataset[k].length;
        }
        if (size >= this.batchSize) {
            client.send((success) => {
                console.log("send success: " + success);
            });
        }
    }

    sendAll() {
        for (let device of this.clients.keys()) {
            this.clients.get(device).send((success) => {
                console.log(device + " - send: " + success);
            });
        }
    }
}

module.exports = Relay;
