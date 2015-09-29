"use strict";
const iobeam = require("iobeam-client");

/* Default max batch size before sending to iobeam */
const DEFAULT_BATCH_SIZE = 3;

class Relay {
    /**
     *  Creates a new relay for a project.
     *
     *  projectId - Project ID that these devices belong to.
     *  projectToken - iobeam token for project
     *  batchSize - Max batch size before sending
     */
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

    /**
     *  Adds data to a particular device's dataset.
     *
     *  deviceId - Which device this data belongs to
     *  dataset - Datapoints in the form of:
     *      {
     *          "series_name": [...]
     *      }
     *  Where the array contains iobeam Datapoints
     */
    addData(deviceId, dataset) {
        // Check if client has data already, if not, create mapping.
        if (!this.clients.has(deviceId)) {
            let temp;
            // Assumes error is duplicate, so set ID.
            const regCb = (success, device) => {
                if (!success) {
                    temp.setDeviceId(deviceId);
                }
            };

            // Setup iobeam client
            const deviceSpec = {deviceId: deviceId};
            temp = iobeam.Builder(this.projectId, this.token)
                            .register(deviceSpec, regCb)
                            .build();
            this.clients.set(deviceId, temp);
        }

        const client = this.clients.get(deviceId);
        console.log("add dataset...");
        // Add all the points
        for (let k in dataset) {
            const arr = dataset[k];
            arr.forEach( (e) => {
                client.addDataPoint(k, e);
            });
        }

        // Calculate client size
        let size = 0;
        for (let k in client.dataset()) {
            size += dataset[k].length;
        }

        // Send if large enough
        if (size >= this.batchSize) {
            client.send((success) => {
                console.log("send success: " + success);
            });
        }
    }

    /**
     *  Send any remaining data to iobeam.
     */
    sendAll() {
        for (let device of this.clients.keys()) {
            this.clients.get(device).send((success) => {
                console.log(device + " - send: " + success);
            });
        }
    }
}

module.exports = Relay;
