const Influx = require('influx');

const influx = new Influx.InfluxDB({
    host: 'localhost',
    database: 'devices',
});

module.exports = influx;