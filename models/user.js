let connection  = require('../config/db')
let LOGGER      = require('../config/logger')

class User {
    constructor() {}

    static checkCredential(login, password, callback) {
        connection.query(`SELECT COUNT(*) AS userCount FROM user WHERE EMAIL = ? AND PASSWORD = ?`,
        [login, password], (error, results, fields) => {
            if (error || results[0].userCount != 1) {
                callback(false)
                return
            }

            callback(true)
        })
    }
}

module.exports = User