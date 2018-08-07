let express         = require('express')
let LOGGER          = require('../config/logger')
let User            = require('../models/user')
let Utils           = require('../utils/utils')
let router          =   express.Router()

router.post('/signin', (request, response) => {
    LOGGER.log('info', 'request POST /signin called')
    
    if(request.session.user != undefined) {
        response.status(200).end("User already logged")
        return
    }
    
    let data = request.body
    if(data.email === undefined) {
        response.status(400).end("Impossible to sign in without login")
        return
    }

    if(data.password === undefined) {
        response.status(400).end("Impossible to sign in without password")
        return
    }

    try {
        User.checkCredential(data.email, data.password, (result) => {
            if(result == true) {
                request.session.cookie.expires = Utils.initExpireCookie()
                request.session.user = data.email
                response.status(200).end()
            } else {
                response.status(401).end('The user login/password are not correct')
            }
        })
    } catch(error) {
        LOGGER.log('error', 'Failed to check the user credential: ' + error)
        response.status(500).end()
    }
})

module.exports = router