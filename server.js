let express     = require('express')
let bodyParser  = require('body-parser')
let LOGGER      = require('./config/logger')
let Item        = require('./models/item')
let Category    = require('./models/category')


let app = express()

app.use(bodyParser.urlencoded({extended: false}))
app.use(bodyParser.json())

app.get('/education', (request, response) => {
    LOGGER.info('info', 'request GET /education called')

    try {
        Item.getByCategory(Category.EDUCATION, items => {
            response.setHeader('Content-Type', 'application/json')
            response.json({items: items})
            response.status(200).end()
        })
    } catch(error) {
        LOGGER.log('error', 'Impossible to get education items: ' + error)
        response.status(500).end('Impossible to get education items')
    }
})

app.post('/new', (request, response) => {
    LOGGER.log('info', 'request POST /new called')

    if(request.body.item === undefined) {
        response.status(400).end()
    }

    let data = request.body.item
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

    item.createdDate = new Date()

    try {
        Item.create(item, (result) => {
            response.setHeader('Content-Type', 'text/plain')
            response.status(200).end(result)
        })
    } catch(error) {
        LOGGER.log('error', 'Failed to create new item: ' + error)
        response.status(500).end()
    }
})

app.listen(8081)