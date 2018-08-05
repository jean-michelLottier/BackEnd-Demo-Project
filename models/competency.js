let connection  = require('../config/db')
let LOGGER      = require('../config/logger')

class Competency {
    constructor(row) {
        if(row != undefined && row != null) {
            this.id = row.ID
            this.labelfk = row.LABELFK
            this.userfk = row.USERFK
        } else {
            this.id
            this.labelfk
            this.userfk
        }
    }

    static link(userfk, labelfk) {
        return new Promise((resolve, reject) => {
            let content = {USERFK: userfk, LABELFK: labelfk}
            connection.query(`INSERT INTO competency SET ?`, content, (error, results, fields) => {
                if(error) {
                    reject(error.message)
                }

                resolve(results.insertId)
            })
        })
    }

    static unlink(userfk, labelfk) {
        return new Promise((resolve, reject) => {
            connection.query(`DELETE FROM competency WHERE USERFK = ? AND LABELFK = ?`, [userfk, labelfk], (error, results, fields) => {
                if(error) {
                    reject(error.message)
                }

                resolve(results)
            })
        })
    }
}

module.exports = Competency