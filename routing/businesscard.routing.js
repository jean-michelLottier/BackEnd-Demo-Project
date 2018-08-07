let express         = require('express')
let LOGGER          = require('../config/logger')
let User            = require('../models/user')
let Utils           = require('../utils/utils')
let BusinessCard    = require('../models/business_card')
let router          = express.Router()

router.get('/', async (request, response) => {
    LOGGER.log('info', 'request GET /businesscard called')
    let user = request.session.user
    if(user != undefined) {
        request.session.cookie.expires = Utils.initExpireCookie()
    } else {
        LOGGER.log('warn', 'No session loaded to access the business card info')
        response.status(401).end('The user is not logged')
        return
    }

    let language = Utils.checkLanguage(request.params.lang)

    try{
        let businessCard = await BusinessCard.getBusinessCard(user, language)
        businessCard.user = user
        response.setHeader('Content-Type', 'application/json')
        response.json(businessCard)
        response.status(200).end()
    } catch(error) {
        LOGGER.log('error', 'Impossible to get the business card of ' + user + ': ' + error)
        response.status(500).end('Impossible to get business card')
    }
})

router.post('/create', async (request, response) => {
    LOGGER.log('info', 'request POST /businesscard/create called')

    if(request.session.user != undefined) {
        request.session.cookie.expires = Utils.initExpireCookie()
    } else {
        LOGGER.log('warn', 'No session loaded to create a business card')
        response.status(401).end('The user is not logged')
        return
    }
    
    let data = request.body
    let businessCard = new BusinessCard()

    try {
        let user = await User.getUserByLogin(request.session.user)
        if(!(await BusinessCard.isBusinessCardExistsForUser(user.id))) {
            throw new Error('There already is a business card')
        }
        businessCard.user = user.id
        data.birthdate != undefined ? businessCard.birthdate = new Date(data.birthdate) : businessCard.birthdate = null
        data.name != undefined ? businessCard.name = data.name : businessCard.name = null
        data.lastname != undefined ? businessCard.lastname = data.lastname : businessCard.lastname = null
        data.email != undefined ? businessCard.email = data.email : businessCard.email = null
        data.phone != undefined ? businessCard.phone = data.phone : businessCard.phone = null
        data.summary != undefined ? businessCard.summary = data.summary : businessCard.summary = null
        data.title != undefined ? businessCard.title = data.title : businessCard.title = null
        businessCard.language = Utils.checkLanguage(data.language)

        let result = await BusinessCard.create(businessCard)
        response.setHeader('Content-Type', 'application/json')
        response.json({result: result.toString()})
        response.status(200).end()
    } catch(error) {
        LOGGER.log('error', 'Impossible to create the business card of \'' + request.session.user + '\' because:\n' + error)
        response.status(500).end('Impossible to create business card')
    }
})

router.post('/update', async (request, response) => {
    LOGGER.log('info', 'request POST /businesscard/update called')
    
    if(request.session.user != undefined) {
        request.session.cookie.expires = Utils.initExpireCookie()
    } else {
        LOGGER.log('warn', 'No session loaded to update a business card')
        response.status(401).end('The user is not logged')
        return
    }
    
    let data = request.body
    let businessCard = new BusinessCard()

    if(data.id === undefined) {
        response.status(400).end("Impossible to update the business card without its id")
        return
    }
    businessCard.id = data.id

    try {
        let user = await User.getUserByLogin(request.session.user)
        businessCard.user = user.id
        data.birthdate != undefined ? businessCard.birthdate = new Date(data.birthdate) : businessCard.birthdate = null
        data.name != undefined ? businessCard.name = data.name : businessCard.name = null
        data.lastname != undefined ? businessCard.lastname = data.lastname : businessCard.lastname = null
        data.email != undefined ? businessCard.email = data.email : businessCard.email = null
        data.phone != undefined ? businessCard.phone = data.phone : businessCard.phone = null
        data.summary != undefined ? businessCard.summary = data.summary : businessCard.summary = null
        data.title != undefined ? businessCard.title = data.title : businessCard.title = null

        let result = await BusinessCard.update(businessCard)
        response.setHeader('Content-Type', 'application/json')
        response.json({result: result.toString()})
        response.status(200).end()
    } catch(error) {
        LOGGER.log('error', 'Impossible to update the business card of \'' + request.session.user + '\' because:\n' + error)
        response.status(500).end('Impossible to update business card')
    }
})

module.exports = router