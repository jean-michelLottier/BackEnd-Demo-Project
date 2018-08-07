let express         = require('express')
let LOGGER          = require('../config/logger')
let Item            = require('../models/item')
let User            = require('../models/user')
let Utils           = require('../utils/utils')
let router          = express.Router()

router.get('/:id', (request, response) => {
    LOGGER.log('info', 'request GET /item called')

    if(request.session.user != undefined) {
        request.session.cookie.expires = Utils.initExpireCookie()
    } else {
        LOGGER.log('warn', 'No session loaded to access the item info')
        response.status(401).end('The user is not logged')
        return
    }

    let id = request.params.id
    if(id === undefined) {
        response.status(400).end('Need to specify the id of the selected item')
        return
    }

    try{
        Item.getById(id, item => {
            response.setHeader('Content-Type', 'application/json')
            response.json(item)
            response.status(200).end()
        })
    } catch(error) {
        LOGGER.log('error', 'Impossible to get the item ' + id + ': ' + error)
        response.status(500).end('Impossible to get education items')
    }
})

router.get('/delete/:id', (request, response) => {
    LOGGER.log('info', 'request GET /delete called')
    
    if(request.session.user != undefined) {
        request.session.cookie.expires = Utils.initExpireCookie()
    } else {
        LOGGER.log('warn', 'No session loaded to access the delete action')
        response.status(401).end('The user is not logged')
        return
    }

    let id = request.params.id
    if(id === undefined) {
        response.status(400).end('Need to specify the id of the item to delete')
        return
    }

    try {
        Item.delete(id, result => {
            response.status(200).end('The item has been deleted successfully')
        })
    }catch(error) {
        LOGGER.log('error', 'Impossible to delete the item: ' + error)
        response.status(500).end()
    }
})

router.post('/new', async (request, response) => {
    LOGGER.log('info', 'request POST /new called')

    if(request.session.user != undefined) {
        request.session.cookie.expires = Utils.initExpireCookie()
    } else {
        LOGGER.log('warn', 'No session loaded to access the creation action')
        response.status(401).end('The user is not logged')
        return
    }

    let data = request.body
    let item = new Item()

    if(data.title === undefined) {
        response.status(400).end("A title is required")
        return
    }
    item.title = data.title

    if(data.description === undefined) {
        response.status(400).end("A description is required")
        return
    }
    item.description = data.description

    if(data.category === undefined) {
        response.status(400).end("A category is required")
        return
    }
    item.category = data.category

    if(data.startExperience == undefined) {
        response.status(400).end("A start experience date is required")
        return
    }
    item.startExperience = new Date(data.startExperience)

    if(data.endExperience != undefined) {
        item.endExperience = new Date(data.endExperience)
    }

    if(data.language != undefined) {
        item.language = Utils.checkLanguage(data.language)
    }

    item.createdDate = new Date()

    try {
        let user = await User.getUserByLogin(request.session.user)
        item.user = user.id
        Item.create(item, (result) => {
            response.setHeader('Content-Type', 'application/json')
            response.json({result: result.toString()})
            response.status(200).end()
        })
    } catch(error) {
        LOGGER.log('error', 'Failed to create new item: ' + error)
        response.status(500).end()
    }
})

router.post('/update', (request, response) => {
    LOGGER.log('info', 'request POST /update called')

    if(request.session.user != undefined) {
        request.session.cookie.expires = Utils.initExpireCookie()
    } else {
        LOGGER.log('warn', 'No session loaded to access the update action')
        response.status(401).end('The user is not logged')
        return
    }

    let data = request.body
    let item = new Item()

    if(data.id === undefined) {
        response.status(400).end("Impossible to update the item without its id")
        return
    }
    item.id = data.id

    if(data.title === undefined) {
        response.status(400).end("A title is required")
        return
    }
    item.title = data.title

    if(data.description === undefined) {
        response.status(400).end("A description is required")
        return
    }
    item.description = data.description

    if(data.category === undefined) {
        response.status(400).end("A category is required")
        return
    }
    item.category = data.category

    if(data.startExperience == undefined) {
        response.status(400).end("A start experience date is required")
        return
    }
    item.startExperience = new Date(data.startExperience)

    if(data.endExperience != undefined) {
        item.endExperience = new Date(data.endExperience)
    }
    
    try {
        Item.update(item, (result) => {
            response.setHeader('Content-Type', 'application/json')
            response.json({result: result.toString()})
            response.status(200).end()
        })
    } catch(error) {
        LOGGER.log('error', 'Failed to update the item: ' + error)
        response.status(500).end()
    }
})

module.exports = router