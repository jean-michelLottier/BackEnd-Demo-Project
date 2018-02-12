let connection = require('../config/db')
let LOGGER = require('../config/logger')
let Language = require('../models/language')

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
            this.language = row.LANGUAGE
        } else {
            this.id
            this.title
            this.description
            this.createdDate
            this.category
            this.startExperience
            this.endExperience
            this.language = Language.FRENCH
        }
    }

    toString() {
        return "id: "               + this.id               + "\n" +
                "title: "           + this.title            + "\n" +
                "description: "     + this.description      + "\n" +
                "createdDate: "     + this.createdDate      + "\n" +
                "category: "        + this.category         + "\n" +
                "startExperience: " + this.startExperience  + "\n" +
                "endExperience: "   + this.endExperience    + "\n" +
                "language: "        + this.language;
    }

    static all(callback) {
        connection.query(`SELECT * FROM item`, (error, results, fields) => {
            if (error) {
                throw error
            }

            callback(results.map(row => new Item(row)))
        })
    }

    static getByCategory(category, language = Language.FRENCH, callback) {
        connection.query(`SELECT * FROM item WHERE CATEGORY = ? AND LANGUAGE = ?`,
         [category, language], (error, results, fields) => {
            if(error) {
                throw error
            }

            callback(results.map(row => new Item(row)))
        })
    }

    static getById(id, callback) {
        connection.query(`SELECT * FROM item WHERE ID = ?`, id, (error, result, fields) => {
            if(error) {
                throw error
            }
            
            if(result.length === 1) {
                callback(new Item(result[0]))
            } else {
                callback(new Item())
            }
        })
    }

    static create(item, callback) {
        let content = {TITLE: item.title, DESCRIPTION: item.description, CREATED_DATE: item.createdDate,
            CATEGORY: item.category, START_EXPERIENCE: item.startExperience, 
            END_EXPERIENCE: item.endExperience, LANGUAGE: item.language, USERFK: item.user}

        connection.query(`INSERT INTO item SET ?`, content, (error, results, fields) => {
            if(error) {
                throw error
            }

            callback(results.insertId)
        })
    }

    static update(item, callback) {
        let content = [item.title, item.description, item.category, item.startExperience, item.endExperience, item.id]
        connection.query(`UPDATE item SET TITLE = ?, DESCRIPTION = ?, CATEGORY = ?, 
        START_EXPERIENCE = ?, END_EXPERIENCE = ? WHERE ID = ?`, content, (error, results, fields) => {
            if(error) {
                throw error
            }

            if(results.changedRows !== 1) {
                throw new Error("Failed to update item with id: " + item.id)
            }

            callback(results.changedRows)
        })
    }

    static delete(id, callback) {
        connection.query(`DELETE FROM item WHERE ID = ?`, id, (error, results, fields) => {
            if(error) {
                throw error
            }

            callback(results.affectedRows)
        })
    }
}

module.exports = Item