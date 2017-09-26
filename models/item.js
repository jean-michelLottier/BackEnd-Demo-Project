let connection = require('../config/db')
let LOGGER = require('../config/logger')

class Item {

    constructor(row) {
        if(row != undefined && row != null) {
            this.id = row.ID
            this.title = row.TITLE
            this.description = row.DESCRIPTION
            this.createdDate = row.CREATED_DATE
            this.category = row.CATEGORY
            this.startExperience = row.START_EXPERIENCE
            this.endExperience = row.END_EXPERIENCE
        } else {
            this.id
            this.title
            this.description
            this.createdDate
            this.category
            this.startExperience
            this.endExperience
        }
    }

    static all(callback) {
        connection.query(`SELECT * FROM item`, (error, results, fields) => {
            if (error) {
                throw error
            }

            callback(results.map(row => new Item(row)))
        })
    }

    static getByCategory(category, callback) {
        connection.query(`SELECT * FROM item WHERE CATEGORY = ?`, category, (error, results, fields) => {
            if(error) {
                throw error
            }

            callback(results.map(row => new Item(row)))
        })
    }

    static create(item, callback) {
        let content = {TITLE: item.title, DESCRIPTION: item.description, CREATED_DATE: item.createdDate,
            CATEGORY: item.category, START_EXPERIENCE: item.startExperience, END_EXPERIENCE: item.endExperience}

        connection.query(`INSERT INTO item SET ?`, content, (error, result, fields) => {
            if(error) {
                throw error
            }

            callback(result)
        })
    }

    static update(item, callback) {
        let content = [item.title, item.description, item.category, item.startExperience, item.endExperience]
        connection.query(`UPDATE item SET TITLE = ?, DESCRIPTION = ?, CATEGORY = ?, 
        START_EXPERIENCE = ?, END_EXPERIENCE`, content, (error, result, fields) => {
            if(error) {
                throw error
            }

            callback(result)
        })
    }

    static delete(id, callback) {
        connection.query(`DELETE FROM item WHERE ID = ?`, id, (error, result, fields) => {
            if(error) {
                throw error
            }

            callback(result)
        })
    }
}

module.exports = Item