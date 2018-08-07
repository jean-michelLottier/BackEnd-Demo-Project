let express         = require('express')
let LOGGER          = require('../config/logger')
let Label           = require('../models/label')
let Competency      = require('../models/competency') 
let User            = require('../models/user')
let Utils           = require('../utils/utils')
let router          = express.Router()

router.get('/search', async (request, response) => {
    LOGGER.log('info', 'request GET /label/search called')

    if(null === request.query.entry || request.query.entry.length < 3) {
        response.setHeader('Content-Type', 'application/json')    
        response.status(200).end()
        return
    }
    
    try {
        Label.getLabelsByEntry(request.query.entry, (labels) => {
            response.setHeader('Content-Type', 'application/json')
            response.json(labels)
            response.status(200).end()
        })
    } catch(error) {
        response.status(500).end('Failed to search labels. The reason is: ' + error.message)
    }
})

router.post('/add', async (request, response) => {
    LOGGER.log('info', 'request POST /label/add called')

    // Check the user session
    if(request.session.user != undefined) {
        request.session.cookie.expires = Utils.initExpireCookie()
    } else {
        LOGGER.log('warn', 'No session loaded to add a label')
        response.status(401).end('The user is not logged')
        return
    }
    console.log('TEST1')
    let data = request.body
    console.log('data: ' + data)
    // If no label well we can't add a new competency...
    if(undefined === data.name || data.name.length < 3) {
        response.status(400).end("Impossible to add an empty label")
        return
    }
    console.log('TEST2')
    let user = new User()
    // Need user infos to link this one with a new label
    try {
        user = await User.getUserByLogin(request.session.user)
        console.log('TEST3')
    } catch(error) {
        response.status(500).end('Impossible to find user informations')
        return
    }

    let label = new Label()
    // If the label doesn't exist yet then we first create it
    if(undefined === data.id) {
        label.name = data.name
        try {
            label.id = await Label.create(label)
        } catch(error) {
            response.status(500).end('Impossible to create a new label')
            return
        }
    } else {
        // Otherwise we check if the label exists
        try {
            label = await Label.getLabelById(data.id)
        } catch(error) {
            response.status(500).end('Impossible to find the selected label')
            return
        }
    }

    // Time to add a new competency for the user
    try {
        let result = await Competency.link(user.id, label.id)
        response.setHeader('Content-Type', 'application/json')
        response.json({result: result.toString()})
        response.status(200).end()
    } catch(error) {
        LOGGER.log('error', 'Impossible to set a new competency for \'' + request.session.user + '\' because:\n' + error)
        response.status(500).end('Impossible to set a new competency')
    }
})

router.get('/delete', async (request, response) => {
    LOGGER.log('info', 'request GET /label/delete called')

    // Check the user session
    if(request.session.user != undefined) {
        request.session.cookie.expires = Utils.initExpireCookie()
    } else {
        LOGGER.log('warn', 'No session loaded to add a label')
        response.status(401).end('The user is not logged')
        return
    }

    if(null === request.query.id || request.query.id === "") {
        response.status(200).end()
        return
    }

    let user = new User()
    // Need user infos to unlink the label
    try {
        user = await User.getUserByLogin(request.session.user)
    } catch(error) {
        response.status(500).end('Impossible to find user informations')
        return
    }    

    let result
    try {
        result = await Competency.unlink(user.id, request.query.id)
    } catch(error) {
        response.status(500).end('Failed to remove the label because: ' + error)
        return
    }

    response.setHeader('Content-Type', 'application/json')
    response.json({result: result.toString()})
    response.status(200).end()
})

module.exports = router