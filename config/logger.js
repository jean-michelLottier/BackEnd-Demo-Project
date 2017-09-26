let winston = require('winston')

let LOGGER = new (winston.Logger)({
    transports: [
        new (winston.transports.Console)(),
        new (winston.transports.File)({ filename: './log/server.log' })
    ]
})

module.exports = LOGGER