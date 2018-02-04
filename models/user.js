let connection  = require('../config/db')
let LOGGER      = require('../config/logger')

class User {
    constructor(row) {
        if(row != undefined && row != null) {
            this.id = row.ID
            this.login = row.EMAIL
            this.password = row.PASSWORD
            this.username = row.USERNAME
            this.createdDate = row.CREATED_DATE 
        } else {
            this.id
            this.login
            this.password
            this.username
            this.createdDate
        }
    }

    static checkCredential(login, password, callback) {
        connection.query(`SELECT COUNT(*) AS userCount FROM user WHERE EMAIL = ? AND PASSWORD = ?`,
        [login, password], (error, results, fields) => {
            if (error || results[0].userCount != 1) {
                LOGGER.log('error', 'No user found for the given credentials')
                callback(false)
                return
            }

            callback(true)
        })
    }

    static getUserByLogin(login) {
        return new Promise((resolve, reject) => {
            connection.query(`SELECT * FROM user WHERE EMAIL= ?`, login, (error, results, fields) => {
            
                if(error) {
                    reject(error.message)
                }

                if(results != undefined && results.length === 1) {
                    resolve(new User(results[0]))
                } else {
                    reject("No unique user found")
                }
            })
        })
    }
}

module.exports = User