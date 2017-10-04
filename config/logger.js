let fs = require('fs')
let winston = require('winston')

let currentFilePath = "./log/server-" + (new Date()).toLocaleDateString().replace(new RegExp('-', 'g'), "") + ".log"
if(!fs.existsSync(currentFilePath)) {
    fs.closeSync(fs.openSync(currentFilePath, 'w'))
}

let LOGGER = new (winston.Logger)({
    transports: [
        new (winston.transports.Console)(),
        new (winston.transports.File)({ filename: currentFilePath })
    ]
})

module.exports = LOGGER