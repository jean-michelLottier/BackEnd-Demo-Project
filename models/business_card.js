let connection  = require('../config/db')
let LOGGER      = require('../config/logger')

class BusinessCard {
    constructor(row) {
        if(row != undefined && row != null) {
            this.id         = row.ID
            this.user       = row.USERFK
            this.name       = row.NAME
            this.lastname   = row.LASTNAME
            this.birthdate  = row.BIRTHDATE
            this.email      = row.EMAIL
            this.phone      = row.PHONE
            this.summary    = row.SUMMARY
            this.language   = row.LANGUAGE
            this.title      = row.TITLE
        } else {
            this.id
            this.user
            this.name
            this.lastname
            this.birthdate
            this.email
            this.phone
            this.summary
            this.language
            this.title
        }
    }

    toString() {
        return "id: "           + this.id           + "\n" +
                "user: "        + this.user         + "\n" +
                "name: "        + this.name         + "\n" +
                "lastname: "    + this.lastname     + "\n" +
                "birthdate: "   + this.birthdate    + "\n" +
                "email: "       + this.email        + "\n" +
                "phone: "       + this.phone        + "\n" +
                "language: "    + this.language     + "\n" +
                "title: "       + this.title        + "\n" +
                "summary: "     + (this.summary === undefined? this.summary : this.summary.substring(0,20) + "...")
    }

    static getBusinessCard(user, language) {
        return new Promise((resolve, reject) => {
            connection.query(`SELECT * FROM business_card WHERE USERFK = 
            (SELECT ID FROM USER WHERE EMAIL = ?) AND LANGUAGE = ?`, [user, language], (error, results, fields) => {
                if(error) {
                    reject(error.message)
                }

                if(results.length === 1) {
                    resolve(new BusinessCard(results[0]))
                } else {
                    reject('No unique business card found!')
                }
                
            })
        })
    }

    static create(businessCard) {
        return new Promise((resolve, reject) => {
            let content = {USERFK: businessCard.user, NAME: businessCard.name, LASTNAME: businessCard.lastname,
                BIRTHDATE: businessCard.birthdate, EMAIL: businessCard.email, PHONE: businessCard.phone,
                SUMMARY: businessCard.summary, LANGUAGE: businessCard.language, TITLE: businessCard.title}
            connection.query(`INSERT INTO business_card SET ?`, content, (error, results, fields) => {
                if(error) {
                    reject(error.message)
                }
    
                resolve(results.insertId)
            })
        })
    }

    static update(businessCard) {
        return new Promise((resolve, reject) => {
            let content = [businessCard.name, businessCard.lastname, businessCard.birthdate,
                businessCard.email, businessCard.phone, businessCard.summary, businessCard.title, businessCard.id]
            connection.query(`UPDATE business_card SET NAME = ?, LASTNAME = ?,
                BIRTHDATE = ?, EMAIL = ?, PHONE = ?, SUMMARY = ?, TITLE = ? WHERE ID = ?`, 
                content, (error, results, fields) => {
                if(error) {
                    reject(error.message)
                }
    
                if(results.changedRows !== 1) {
                    reject("Failed to update item with id: " + businessCard.id)
                }
    
                resolve(results.changedRows)
            })
        })
    }

    static isBusinessCardExistsForUser(userId) {
        return new Promise((resolve, reject) => {
            connection.query(`SELECT COUNT(*) AS bcCount FROM business_card WHERE USERFK = ?`, userId,
            (error, results, fields) => {
                if(error) {
                    return reject(error.message)
                }

                if(results[0].bcCount === 1) {
                    resolve(true)
                } else {
                    resolve(false)
                }
            })
        })
    }
}

module.exports = BusinessCard