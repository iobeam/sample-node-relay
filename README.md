# iobeam Node relay server

**[iobeam](https://iobeam.com)** is a data platform for connected devices.

## What is this?

This is a sample application using iobeam's [NodeJS
library](https://www.npmjs.com/package/iobeam-client). This sample
can act as a 'relay' or backend server that handles forwarding data
for multiple devices. As data comes in from various devices, the
relay partitions and stores the data, later forwarding the data to
the iobeam backend.

## Installation

Simple clone this repo and run `npm install`. Requires Node v4 or
higher.

## Sample Usage

    "use strict";
    const Relay = require("./src/relay");
    const iobeam = require("iobeam-client");

    const token = "YOUR PROJECT TOKEN";
    const id = <YOUR_PROJECT_ID>;

    // Create the relay server for this project, batch size defaults
    // to 3, so after 3 or more points per device, data will be sent
    const r = new Relay(id, token);

    // Now add data for various devices...
    // `device1`:
    r.addData("device1", {
        "series1": [iobeam.Datapoint(1), iobeam.Datapoint(2)]
    });
    // These data points will total 5, so data will be sent async
    r.addData("device1", {
        "series1": [iobeam.Datapoint(3)],
        "series2": [iobeam.Datapoint(4), iobeam.Datapoint(5)]
    });

    // Now add data to another device, `device2`:
    r.addData("device2", {
        "series1b": [iobeam.Datapoint(6)]
    });

    // Exiting, so send all remaining data:
    r.sendAll();
