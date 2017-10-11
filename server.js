let express     = require('express')
let bodyParser  = require('body-parser')
let cors        = require('cors')
let LOGGER      = require('./config/logger')
let Item        = require('./models/item')
let Category    = require('./models/category')


let app = express()

app.use(bodyParser.urlencoded({extended: false}))
app.use(bodyParser.json())

let whiteList = ["http://localhost:4200", "http://127.0.0.1:4200", 
                    "http://192.168.99.100:8080", "http://webapp:8080", "http://demoproject:8080"]
let corsOptions = {
    origin: (origin, callback) => {
        if(whiteList.indexOf(origin) !== -1) {
            callback(null, true)
        } else {
            callback(new Error('Not allowed by CORS'))
        }
    }
}

app.use(cors(corsOptions))

app.get('/education', (request, response) => {
    LOGGER.log('info', 'request GET /education called')

    try {
        Item.getByCategory(Category.EDUCATION, items => {
            response.setHeader('Content-Type', 'application/json')
            response.json(items)
            response.status(200).end()
        })
    } catch(error) {
        LOGGER.log('error', 'Impossible to get education items: ' + error)
        response.status(500).end('Impossible to get education items')
    }
})

app.get('/professional_experience', (request, response) => {
    LOGGER.log('info', 'request GET /porfessional_experience called')

    try {
        Item.getByCategory(Category.PROFESSIONAL_EXPERIENCE, items => {
            response.setHeader('Content-Type', 'application/json')
            response.json(items)
            response.status(200).end()
        })
    } catch(error) {
        LOGGER.log('error', 'Impossible to get education items: ' + error)
        response.status(500).end('Impossible to get professional experience items')
    }
})

app.get('/hobby', (request, response) => {
    LOGGER.log('info', 'request GET /hobby called')

    try {
        Item.getByCategory(Category.HOBBY, items => {
            response.setHeader('Content-Type', 'application/json')
            response.json(items)
            response.status(200).end()
        })
    } catch(error) {
        LOGGER.log('error', 'Impossible to get hobby items: ' + error)
        response.status(500).end('Impossible to get hobby items')
    }
})

app.get('/item/:id', (request, response) => {
    LOGGER.log('info', 'request GET /item called')
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

app.get('/delete/:id', (request, response) => {
    LOGGER.log('info', 'request GET /delete called')
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

app.post('/new', (request, response) => {
    LOGGER.log('info', 'request POST /new called')

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

    item.createdDate = new Date()

    try {
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

app.post('/update', (request, response) => {
    LOGGER.log('info', 'request POST /update called')
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

app.listen(8081)