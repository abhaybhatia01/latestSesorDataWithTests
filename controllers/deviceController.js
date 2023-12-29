const excelJS = require("exceljs")
const influx = require("../config/influx.config")
const UserDevice = require('../models/UserDevice');


const getDevice = async (req, res) => {
    try {
        res.status(201).json({ "name": "abhay" });
    } catch (error) {
        res.status(500).json({ message: 'Internal server error', error: error });
    }
};


const getLatestSensorsData = async (req, res) => {
    try {
        const devId = req.query.devId;
        const userId = req.sessionData.userId;
        const precision = req.query.precision;

        const influxResult = await getLatestSensorsDataAndCalibrate(devId, userId, precision)
        if(influxResult.result !== 200){
            return res.status(influxResult.result).json({message:influxResult.message})
        }
        return res.json({message: "device found", latestData: influxResult.calibratedResult})

    } catch (error) {
        console.log(error)
        return res.status(500).json({ message: 'Internal server error' });
    }
};

const DownloadLatestSensorDataInExcel = async (req, res) => {
    try {
        const devId = req.query.devId;
        const precision = req.query.precision;
        const userId = req.sessionData.userId;
        const userEmail = req.sessionData.email;


        const influxResult = await getLatestSensorsDataAndCalibrate(devId, userId, precision)
        if(influxResult.result !== 200){
            return res.status(influxResult.result).json({message:influxResult.message})
        }
        latestData = influxResult.calibratedResult

        const workbook = new excelJS.Workbook();
        const worksheet = workbook.addWorksheet("Data");

        worksheet.addRow(["Devices last data points report"])
        worksheet.addRow(["Report Generated By", `${userEmail}`])
        worksheet.addRow(["Report Generated At", `${new Date()}`])
        worksheet.addRow(["Device Name", "Sensor Name", "Sensor Value", "Time"])

        worksheet.getRow(4).font = { bold: true };

        worksheet.getColumn('A').width = 30;
        worksheet.getColumn('A').style.alignment = { vertical: "middle" }

        worksheet.getColumn('B').width = 20;
        worksheet.getColumn('C').width = 20;
        worksheet.getColumn('D').width = 20;

        // Add data to the worksheet 
        latestData.forEach(sensorItem => { 
            worksheet.addRow([
                sensorItem.devId, sensorItem.sensor, sensorItem.value, sensorItem.time,
            ]); 
        });

        // Specify the range to merge (starting and ending row and column indices) for device id
        const startRow = 5; // Row index
        const startCol = 1; // Column index (A)
        const endRow = latestData.length + 5 - 1;   // Row index (same as startRow for a single row)
        const endCol = 1;   // Column index (C)

        // Merge cells in the specified range
        worksheet.mergeCells(startRow, startCol, endRow, endCol);

        // Set up the response headers 
        res.setHeader("Content-Type", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"); res.setHeader("Content-Disposition", "attachment; filename=" + `${devId}_latestData.xlsx`);

        // Write the workbook to the response object 
        await workbook.xlsx.write(res)
        return res.end()

    } catch (error) {
        console.log(error)
        res.status(500).json({ message: 'Internal server error' });
    }
};


// Export post functions
module.exports = {
    getDevice,
    addUserDevice,
    getLatestSensorsData,
    DownloadLatestSensorDataInExcel,
};





async function getLatestSensorsDataAndCalibrate(devId, userId, precision) {
    try {

        // const userId = "6576a14087420b405e624349";
        // const userEmail = "abhay";

        if (!devId || !userId) {
            return {result : 400, message: "userId and devId are required" }
        }

        const userDevice = await UserDevice.findOne({ devID: devId, added_by: userId })
        if (!userDevice) {
            return {result: 404, message: "no device is created by you" }
        }

        const result = await influx.query(`SELECT last("value") AS "last_value" FROM ${devId} GROUP BY "sensor"`)
        if (result.length == 0 ){
            return {result: 404, message: "no device data found in influx" }
        }

        const calibratedResult = [];

        // Iterate through each sensor item in the result array
        result.forEach((sensorItem) => {
            // Check if the sensor has unitSelected and params
            if (  userDevice.unitSelected[sensorItem.sensor] && userDevice.params[sensorItem.sensor]) {
                // Extract calibration parameters (m, c, min, max)
                const m = userDevice.params[sensorItem.sensor]?.find(param => param.paramName === 'm')?.paramValue;
                const c = userDevice.params[sensorItem.sensor]?.find(param => param.paramName === 'c')?.paramValue;
                const min = userDevice.params[sensorItem.sensor]?.find(param => param.paramName === 'min')?.paramValue;
                const max = userDevice.params[sensorItem.sensor]?.find(param => param.paramName === 'max')?.paramValue;

                // Extract sensor values
                const x = sensorItem.last_value;

                // Calculate calibrated value using the calibration formula
                let y = (Number(m) * Number(x)) + Number(c);

                // Apply precision if specified
                if (precision) {
                    y = Number(y.toFixed(precision));
                }

                // Clamp the calibrated value within the specified range (min to max)
                y = Math.min(Math.max(y, min), max);

                // Create calibrated result item
                const calibratedItem = {
                        devId: sensorItem.sensor,
                        sensor : sensorItem.sensor,
                        value: `${y} ${userDevice.unitSelected[sensorItem.sensor]}`,
                        time: sensorItem.time,
                     }
                // Push the calibrated item to the result array
                calibratedResult.push(calibratedItem);
            }
        });
        return {result:200, message:"done" , calibratedResult};
        // Now calibratedResult contains the calibrated sensor values for each applicable sensor

        // above logic
        // device data from mongo
        // sensor data from influx
        // FOR EACH SENSOR DATA CHECK IF UNIT IS SELECTED OR NOT FOR THAT A SENSOR 
        // GET THE VALUE OF M X AND C FROM PARAMS AND CALIBRATE USING MX+C 
        // RETURN THE calibratedResult

    }catch(error){
        console.log(error)
        return {result:500, message:"Internal server error"};
    }
}



    async function addUserDevice(req, res) {
        try {
            const userDevice = new UserDevice(
                {
                    "location": {
                        "longitude": 72.34,
                        "latitude": 19.23
                    },
                    "tags": [
                        "INEM_DEMO"
                    ],
                    "addedOn": "2023-12-22T06:55:54.652Z",
                    "widgets": [],
                    "mapSensorConfig": [],
                    "isHidden": false,
                    "_id": "658532fa112ce09cd0269c54",
                    "devID": "INEM_DEMO",
                    "devName": "INEM_DEMO",
                    "params": {
                        "VOLTS1": [
                            {
                                "paramName": "m",
                                "paramValue": "1"
                            },
                            {
                                "paramName": "c",
                                "paramValue": "0"
                            },
                            {
                                "paramName": "min",
                                "paramValue": "0"
                            },
                            {
                                "paramName": "max",
                                "paramValue": "100"
                            },
                            {
                                "paramName": "automation",
                                "paramValue": false
                            }
                        ],
                        "VOLTS2": [
                            {
                                "paramName": "m",
                                "paramValue": "1"
                            },
                            {
                                "paramName": "c",
                                "paramValue": "0"
                            },
                            {
                                "paramName": "min",
                                "paramValue": "0"
                            },
                            {
                                "paramName": "max",
                                "paramValue": "1000"
                            },
                            {
                                "paramName": "automation",
                                "paramValue": false
                            }
                        ],
                        "VOLTS3": [
                            {
                                "paramName": "m",
                                "paramValue": "1"
                            },
                            {
                                "paramName": "c",
                                "paramValue": "0"
                            },
                            {
                                "paramName": "min",
                                "paramValue": "0"
                            },
                            {
                                "paramName": "max",
                                "paramValue": "1000"
                            },
                            {
                                "paramName": "automation",
                                "paramValue": false
                            }
                        ],
                        "CUR1": [
                            {
                                "paramName": "m",
                                "paramValue": "1"
                            },
                            {
                                "paramName": "c",
                                "paramValue": "0"
                            },
                            {
                                "paramName": "min",
                                "paramValue": "0"
                            },
                            {
                                "paramName": "max",
                                "paramValue": "100"
                            },
                            {
                                "paramName": "automation",
                                "paramValue": false
                            }
                        ],
                        "CUR2": [
                            {
                                "paramName": "m",
                                "paramValue": "1"
                            },
                            {
                                "paramName": "c",
                                "paramValue": "0"
                            },
                            {
                                "paramName": "min",
                                "paramValue": "0"
                            },
                            {
                                "paramName": "max",
                                "paramValue": "100"
                            },
                            {
                                "paramName": "automation",
                                "paramValue": false
                            }
                        ],
                        "CUR3": [
                            {
                                "paramName": "m",
                                "paramValue": "1"
                            },
                            {
                                "paramName": "c",
                                "paramValue": "0"
                            },
                            {
                                "paramName": "min",
                                "paramValue": "0"
                            },
                            {
                                "paramName": "max",
                                "paramValue": "100"
                            },
                            {
                                "paramName": "automation",
                                "paramValue": false
                            }
                        ],
                        "W1": [
                            {
                                "paramName": "m",
                                "paramValue": "1"
                            },
                            {
                                "paramName": "c",
                                "paramValue": "0"
                            },
                            {
                                "paramName": "min",
                                "paramValue": "0"
                            },
                            {
                                "paramName": "max",
                                "paramValue": "1000"
                            },
                            {
                                "paramName": "automation",
                                "paramValue": false
                            }
                        ],
                        "W2": [
                            {
                                "paramName": "m",
                                "paramValue": "1"
                            },
                            {
                                "paramName": "c",
                                "paramValue": "0"
                            },
                            {
                                "paramName": "min",
                                "paramValue": "0"
                            },
                            {
                                "paramName": "max",
                                "paramValue": "1000"
                            },
                            {
                                "paramName": "automation",
                                "paramValue": false
                            }
                        ],
                        "W3": [
                            {
                                "paramName": "m",
                                "paramValue": "1"
                            },
                            {
                                "paramName": "c",
                                "paramValue": "0"
                            },
                            {
                                "paramName": "min",
                                "paramValue": "0"
                            },
                            {
                                "paramName": "max",
                                "paramValue": "1000"
                            },
                            {
                                "paramName": "automation",
                                "paramValue": false
                            }
                        ],
                        "PF1": [
                            {
                                "paramName": "m",
                                "paramValue": "1"
                            },
                            {
                                "paramName": "c",
                                "paramValue": "0"
                            },
                            {
                                "paramName": "min",
                                "paramValue": "0"
                            },
                            {
                                "paramName": "max",
                                "paramValue": "1"
                            },
                            {
                                "paramName": "automation",
                                "paramValue": false
                            }
                        ],
                        "PF2": [
                            {
                                "paramName": "m",
                                "paramValue": "1"
                            },
                            {
                                "paramName": "c",
                                "paramValue": "0"
                            },
                            {
                                "paramName": "min",
                                "paramValue": "0"
                            },
                            {
                                "paramName": "max",
                                "paramValue": "1"
                            },
                            {
                                "paramName": "automation",
                                "paramValue": false
                            }
                        ],
                        "PF3": [
                            {
                                "paramName": "m",
                                "paramValue": "1"
                            },
                            {
                                "paramName": "c",
                                "paramValue": "0"
                            },
                            {
                                "paramName": "min",
                                "paramValue": "0"
                            },
                            {
                                "paramName": "max",
                                "paramValue": "1"
                            },
                            {
                                "paramName": "automation",
                                "paramValue": false
                            }
                        ],
                        "PFAVG": [
                            {
                                "paramName": "m",
                                "paramValue": "1"
                            },
                            {
                                "paramName": "c",
                                "paramValue": "0"
                            },
                            {
                                "paramName": "min",
                                "paramValue": "0"
                            },
                            {
                                "paramName": "max",
                                "paramValue": "1"
                            },
                            {
                                "paramName": "automation",
                                "paramValue": false
                            }
                        ],
                        "FREQ": [
                            {
                                "paramName": "m",
                                "paramValue": "1"
                            },
                            {
                                "paramName": "c",
                                "paramValue": "0"
                            },
                            {
                                "paramName": "min",
                                "paramValue": "0"
                            },
                            {
                                "paramName": "max",
                                "paramValue": "100"
                            },
                            {
                                "paramName": "automation",
                                "paramValue": false
                            }
                        ],
                        "REACTIVE": [
                            {
                                "paramName": "m",
                                "paramValue": "1"
                            },
                            {
                                "paramName": "c",
                                "paramValue": "0"
                            },
                            {
                                "paramName": "min",
                                "paramValue": "0"
                            },
                            {
                                "paramName": "max",
                                "paramValue": "1000"
                            },
                            {
                                "paramName": "automation",
                                "paramValue": false
                            }
                        ],
                        "ACTIVE": [
                            {
                                "paramName": "m",
                                "paramValue": "1"
                            },
                            {
                                "paramName": "c",
                                "paramValue": "0"
                            },
                            {
                                "paramName": "min",
                                "paramValue": "0"
                            },
                            {
                                "paramName": "max",
                                "paramValue": "1000"
                            },
                            {
                                "paramName": "automation",
                                "paramValue": false
                            }
                        ],
                        "MDKW": [
                            {
                                "paramName": "m",
                                "paramValue": "1"
                            },
                            {
                                "paramName": "c",
                                "paramValue": "0"
                            },
                            {
                                "paramName": "min",
                                "paramValue": "0"
                            },
                            {
                                "paramName": "max",
                                "paramValue": "1000"
                            },
                            {
                                "paramName": "automation",
                                "paramValue": false
                            }
                        ],
                        "MD": [
                            {
                                "paramName": "m",
                                "paramValue": "1"
                            },
                            {
                                "paramName": "c",
                                "paramValue": "0"
                            },
                            {
                                "paramName": "min",
                                "paramValue": "0"
                            },
                            {
                                "paramName": "max",
                                "paramValue": "1000"
                            },
                            {
                                "paramName": "automation",
                                "paramValue": false
                            }
                        ],
                        "RSSI": [
                            {
                                "paramName": "automation",
                                "paramValue": false
                            }
                        ]
                    },
                    "sensors": [
                        {
                            "sensorId": "VOLTS1",
                            "sensorName": "Voltage 200",
                            "globalName": "Voltage 1"
                        },
                        {
                            "sensorId": "VOLTS2",
                            "sensorName": "Voltage 2",
                            "globalName": "Voltage 2"
                        },
                        {
                            "sensorId": "VOLTS3",
                            "sensorName": "Voltage 3",
                            "globalName": "Voltage 3"
                        },
                        {
                            "sensorId": "CUR1",
                            "sensorName": "Current 1",
                            "globalName": "Current 1"
                        },
                        {
                            "sensorId": "CUR2",
                            "sensorName": "Current 2",
                            "globalName": "Current 2"
                        },
                        {
                            "sensorId": "CUR3",
                            "sensorName": "Current 3",
                            "globalName": "Current 3"
                        },
                        {
                            "sensorId": "W1",
                            "sensorName": "Power 1",
                            "globalName": "Power 1"
                        },
                        {
                            "sensorId": "W2",
                            "sensorName": "Power 2",
                            "globalName": "Power 2"
                        },
                        {
                            "sensorId": "W3",
                            "sensorName": "Power 3",
                            "globalName": "Power 3"
                        },
                        {
                            "sensorId": "PF1",
                            "sensorName": "Power Factor 1",
                            "globalName": "Power Factor 1"
                        },
                        {
                            "sensorId": "PF2",
                            "sensorName": "Power Factor 2",
                            "globalName": "Power Factor 2"
                        },
                        {
                            "sensorId": "PF3",
                            "sensorName": "Power Factor 3",
                            "globalName": "Power Factor 3"
                        },
                        {
                            "sensorId": "PFAVG",
                            "sensorName": "Avg. Power Factor ",
                            "globalName": "Avg. Power Factor "
                        },
                        {
                            "sensorId": "FREQ",
                            "sensorName": "Frequency",
                            "globalName": "Frequency"
                        },
                        {
                            "sensorId": "REACTIVE",
                            "sensorName": "Reactive Power",
                            "globalName": "Reactive Power"
                        },
                        {
                            "sensorId": "ACTIVE",
                            "sensorName": "Active Power",
                            "globalName": "Active Power"
                        },
                        {
                            "sensorId": "MDKW",
                            "sensorName": "Max. Demand (kW)",
                            "globalName": "Max. Demand (kW)"
                        },
                        {
                            "sensorId": "MD",
                            "sensorName": "Max. Demand",
                            "globalName": "Max. Demand"
                        },
                        {
                            "sensorId": "RSSI",
                            "sensorName": "Network Strength",
                            "globalName": "Network Strength"
                        }
                    ],
                    "devTypeID": "EMTPH",
                    "devTypeName": "Energymeter",
                    "topic": "devicesIn/INEM_DEMO/data",
                    "star": false,
                    "unit": {
                        "RSSI": [],
                        "MD": [
                            "KVAr"
                        ],
                        "MDKW": [
                            "KW"
                        ],
                        "ACTIVE": [
                            "KW"
                        ],
                        "REACTIVE": [
                            "KVAr"
                        ],
                        "FREQ": [
                            "Hz"
                        ],
                        "PFAVG": [],
                        "PF3": [],
                        "PF2": [],
                        "PF1": [],
                        "W3": [
                            "KW"
                        ],
                        "W2": [
                            "KW"
                        ],
                        "W1": [
                            "KW"
                        ],
                        "CUR3": [
                            "A"
                        ],
                        "CUR2": [
                            "A"
                        ],
                        "CUR1": [
                            "A"
                        ],
                        "VOLTS3": [
                            "V"
                        ],
                        "VOLTS2": [
                            "V"
                        ],
                        "VOLTS1": [
                            "V"
                        ]
                    },
                    "unitSelected": {
                        "RSSI": "",
                        "MD": "KVAr",
                        "MDKW": "KW",
                        "ACTIVE": "KW",
                        "REACTIVE": "KVAr",
                        "FREQ": "Hz",
                        "PFAVG": "",
                        "PF3": "",
                        "PF2": "",
                        "PF1": "",
                        "W3": "KW",
                        "W2": "KW",
                        "W1": "KW",
                        "CUR3": "A",
                        "CUR2": "A",
                        "CUR1": "A",
                        "VOLTS3": "V",
                        "VOLTS2": "V",
                        "VOLTS1": "V"
                    },
                    "properties": [
                        {
                            "propertyName": "connectionTimeout",
                            "propertyValue": 150
                        },
                        {
                            "propertyName": "automation",
                            "propertyValue": false
                        },
                        {
                            "propertyName": "breakdownTimeout",
                            "propertyValue": 7200
                        }
                    ],
                    "added_by": "657051f7e1249a824b74851a",
                    "config": [],
                    "geoFences": [],
                    "custom": {
                        "VOLTS1": [
                            {
                                "customShow": "Raw Variable",
                                "customVariable": "INEM_DEMO_VOLTS1"
                            },
                            {
                                "customShow": "Processed Reading",
                                "customVariable": "1*INEM_DEMO_VOLTS1+0"
                            }
                        ],
                        "VOLTS2": [
                            {
                                "customShow": "Raw Variable",
                                "customVariable": "INEM_DEMO_VOLTS2"
                            },
                            {
                                "customShow": "Processed Reading",
                                "customVariable": "1*INEM_DEMO_VOLTS2+0"
                            }
                        ],
                        "VOLTS3": [
                            {
                                "customShow": "Raw Variable",
                                "customVariable": "INEM_DEMO_VOLTS3"
                            },
                            {
                                "customShow": "Processed Reading",
                                "customVariable": "1*INEM_DEMO_VOLTS3+0"
                            }
                        ],
                        "CUR1": [
                            {
                                "customShow": "Raw Variable",
                                "customVariable": "INEM_DEMO_CUR1"
                            },
                            {
                                "customShow": "Processed Reading",
                                "customVariable": "1*INEM_DEMO_CUR1+0"
                            }
                        ],
                        "CUR2": [
                            {
                                "customShow": "Raw Variable",
                                "customVariable": "INEM_DEMO_CUR2"
                            },
                            {
                                "customShow": "Processed Reading",
                                "customVariable": "1*INEM_DEMO_CUR2+0"
                            }
                        ],
                        "CUR3": [
                            {
                                "customShow": "Raw Variable",
                                "customVariable": "INEM_DEMO_CUR3"
                            },
                            {
                                "customShow": "Processed Reading",
                                "customVariable": "1*INEM_DEMO_CUR3+0"
                            }
                        ],
                        "W1": [
                            {
                                "customShow": "Raw Variable",
                                "customVariable": "INEM_DEMO_W1"
                            },
                            {
                                "customShow": "Processed Reading",
                                "customVariable": "1*INEM_DEMO_W1+0"
                            }
                        ],
                        "W2": [
                            {
                                "customShow": "Raw Variable",
                                "customVariable": "INEM_DEMO_W2"
                            },
                            {
                                "customShow": "Processed Reading",
                                "customVariable": "1*INEM_DEMO_W2+0"
                            }
                        ],
                        "W3": [
                            {
                                "customShow": "Raw Variable",
                                "customVariable": "INEM_DEMO_W3"
                            },
                            {
                                "customShow": "Processed Reading",
                                "customVariable": "1*INEM_DEMO_W3+0"
                            }
                        ],
                        "PF1": [
                            {
                                "customShow": "Raw Variable",
                                "customVariable": "INEM_DEMO_PF1"
                            },
                            {
                                "customShow": "Processed Reading",
                                "customVariable": "1*INEM_DEMO_PF1+0"
                            }
                        ],
                        "PF2": [
                            {
                                "customShow": "Raw Variable",
                                "customVariable": "INEM_DEMO_PF2"
                            },
                            {
                                "customShow": "Processed Reading",
                                "customVariable": "1*INEM_DEMO_PF2+0"
                            }
                        ],
                        "PF3": [
                            {
                                "customShow": "Raw Variable",
                                "customVariable": "INEM_DEMO_PF3"
                            },
                            {
                                "customShow": "Processed Reading",
                                "customVariable": "1*INEM_DEMO_PF3+0"
                            }
                        ],
                        "PFAVG": [
                            {
                                "customShow": "Raw Variable",
                                "customVariable": "INEM_DEMO_PFAVG"
                            },
                            {
                                "customShow": "Processed Reading",
                                "customVariable": "1*INEM_DEMO_PFAVG+0"
                            }
                        ],
                        "FREQ": [
                            {
                                "customShow": "Raw Variable",
                                "customVariable": "INEM_DEMO_FREQ"
                            },
                            {
                                "customShow": "Processed Reading",
                                "customVariable": "1*INEM_DEMO_FREQ+0"
                            }
                        ],
                        "REACTIVE": [
                            {
                                "customShow": "Raw Variable",
                                "customVariable": "INEM_DEMO_REACTIVE"
                            },
                            {
                                "customShow": "Processed Reading",
                                "customVariable": "1*INEM_DEMO_REACTIVE+0"
                            }
                        ],
                        "ACTIVE": [
                            {
                                "customShow": "Raw Variable",
                                "customVariable": "INEM_DEMO_ACTIVE"
                            },
                            {
                                "customShow": "Processed Reading",
                                "customVariable": "1*INEM_DEMO_ACTIVE+0"
                            }
                        ],
                        "MDKW": [
                            {
                                "customShow": "Raw Variable",
                                "customVariable": "INEM_DEMO_MDKW"
                            },
                            {
                                "customShow": "Processed Reading",
                                "customVariable": "1*INEM_DEMO_MDKW+0"
                            }
                        ],
                        "MD": [
                            {
                                "customShow": "Raw Variable",
                                "customVariable": "INEM_DEMO_MD"
                            },
                            {
                                "customShow": "Processed Reading",
                                "customVariable": "1*INEM_DEMO_MD+0"
                            }
                        ],
                        "RSSI": [
                            {
                                "customShow": "Raw Variable",
                                "customVariable": "INEM_DEMO_RSSI"
                            },
                            {
                                "customShow": "Processed Reading",
                                "customVariable": "1*INEM_DEMO_RSSI+0"
                            }
                        ]
                    },
                    "__v": 0,
                    "mapIconConfig": null
                }
            )
            userDevice.save()
            res.status(201).json(userDevice);
        } catch (error) {
            res.status(500).json({ message: 'Internal server error', error: error });
        }
    };