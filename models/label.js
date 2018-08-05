let connection = require('../config/db')
let LOGGER = require('../config/logger')

class Label {
    constructor(row) {
        if(row != undefined && row != null) {
            this.id = row.ID
            this.name = row.NAME
        } else {
            this.id
            this.name
        }
    }

    static getLabelById(id) {
        return new Promise((resolve, reject) => {
            connection.query(`SELECT * FROM label WHERE ID = ?`, id, (error, results, fields) => {
                if(error) {
                    reject(error.message)
                }

                if(results != undefined && results.length === 1) {
                    resolve(new Label(results[0]))
                } else {
                    reject("No unique label found")
                }
            })
        })
    }

    static getLabelsByEntry(entry, callback) {
        entry = "%" + entry + "%"
        connection.query(`SELECT * FROM label WHERE NAME LIKE ?`, entry, (error , results, fields) => {
            if(error) {
                throw error
            }

            callback(results.map(row => new Label(row)))
        })
    }

    static create(label) {
        return new Promise((resolve, reject) => {
            let content = {NAME:label.name}
            connection.query(`INSERT INTO label SET ?`, content, (error, results, fields) => {
                if(error) {
                    reject(error.message)
                }

                resolve(results.insertId)
            })
        })
    }
}

module.exports = Label