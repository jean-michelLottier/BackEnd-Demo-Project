//import { request } from 'https';

let express         = require('express')
let bodyParser      = require('body-parser')
let cookieParser    = require('cookie-parser')
let cors            = require('cors')
let session         = require('express-session')
let RedisStore      = require('connect-redis')(session)
let LOGGER          = require('./config/logger')
let Item            = require('./models/item')
let Category        = require('./models/category')
let User            = require('./models/user')
let BusinessCard    = require('./models/business_card')
let Label           = require('./models/label')
let Competency      = require('./models/competency') 
let utils           = require('./utils/utils')
let Language        = require('./models/language')

let app = express()
let passphrase = 'This is the secret passphrase'

app.use(bodyParser.urlencoded({extended: false}))
app.use(bodyParser.json())
app.use(cookieParser(passphrase))
app.use(session({
    name: 'mydemoproject-session',
    store: new RedisStore({
        // Mode local
        // host: 'demoproject',
        // Mode docker
        host: 'redis',
        port: '6379', 
        db: 0,
        ttl: 60, 
        logErrors: true
    }),
    cookie: {secure: false, maxAge: 3600000, httpOnly: false},
    resave: false,
    saveUninitialized: true,
    secret: passphrase
}))

let whiteList = ["http://localhost:4200", "http://127.0.0.1:4200", 
                    "http://192.168.99.100:8080", "http://webapp:8080", "http://demoproject:8080"]
let corsOptions = {
    origin: (origin, callback) => {
        if(whiteList.indexOf(origin) !== -1) {
            callback(null, true)
        } else {
            callback(new Error('Not allowed by CORS'))
        }
    },
    credentials: true
}

app.use(cors(corsOptions))

app.get('/:lang/education', (request, response) => {
    LOGGER.log('info', 'request GET /education called')
    
    if(request.session.user != undefined) {
        request.session.cookie.expires = utils.initExpireCookie()
    } else {
        LOGGER.log('warn', 'No session loaded to access the education category')
        response.status(401).end('The user is not logged')
        return
    }

    let language = utils.checkLanguage(request.params.lang)

    try {
        Item.getByCategory(Category.EDUCATION, language, items => {
            response.setHeader('Content-Type', 'application/json')
            response.json(items)
            response.status(200).end()
        })
    } catch(error) {
        LOGGER.log('error', 'Impossible to get education items: ' + error)
        response.status(500).end('Impossible to get education items')
    }
})

app.get('/:lang/professional_experience', (request, response) => {
    LOGGER.log('info', 'request GET /porfessional_experience called')

    if(request.session.user != undefined) {
        request.session.cookie.expires = utils.initExpireCookie()
    } else {
        LOGGER.log('warn', 'No session loaded to access the professional experience category')
        response.status(401).end('The user is not logged')
        return
    }

    let language = utils.checkLanguage(request.params.lang)

    try {
        Item.getByCategory(Category.PROFESSIONAL_EXPERIENCE, language, items => {
            response.setHeader('Content-Type', 'application/json')
            response.json(items)
            response.status(200).end()
        })
    } catch(error) {
        LOGGER.log('error', 'Impossible to get education items: ' + error)
        response.status(500).end('Impossible to get professional experience items')
    }
})

app.get('/:lang/hobby', (request, response) => {
    LOGGER.log('info', 'request GET /hobby called')

    if(request.session.user != undefined) {
        request.session.cookie.expires = utils.initExpireCookie()
    } else {
        LOGGER.log('warn', 'No session loaded to access the hobby category')
        response.status(401).end('The user is not logged')
        return
    }

    let language = utils.checkLanguage(request.params.lang)

    try {
        Item.getByCategory(Category.HOBBY, language, items => {
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

    if(request.session.user != undefined) {
        request.session.cookie.expires = utils.initExpireCookie()
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

app.get('/delete/:id', (request, response) => {
    LOGGER.log('info', 'request GET /delete called')
    
    if(request.session.user != undefined) {
        request.session.cookie.expires = utils.initExpireCookie()
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

app.post('/new', async (request, response) => {
    LOGGER.log('info', 'request POST /new called')

    if(request.session.user != undefined) {
        request.session.cookie.expires = utils.initExpireCookie()
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
        item.language = utils.checkLanguage(data.language)
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

app.post('/update', (request, response) => {
    LOGGER.log('info', 'request POST /update called')

    if(request.session.user != undefined) {
        request.session.cookie.expires = utils.initExpireCookie()
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

app.post('/signin', (request, response) => {
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
                request.session.cookie.expires = utils.initExpireCookie()
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

app.get('/:lang/businesscard', async (request, response) => {
    LOGGER.log('info', 'request GET /businesscard called')
    let user = request.session.user
    if(user != undefined) {
        request.session.cookie.expires = utils.initExpireCookie()
    } else {
        LOGGER.log('warn', 'No session loaded to access the business card info')
        response.status(401).end('The user is not logged')
        return
    }

    let language = utils.checkLanguage(request.params.lang)

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

app.post('/businesscard/create', async (request, response) => {
    LOGGER.log('info', 'request POST /businesscard called')

    if(request.session.user != undefined) {
        request.session.cookie.expires = utils.initExpireCookie()
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
        businessCard.language = utils.checkLanguage(data.language)

        let result = await BusinessCard.create(businessCard)
        response.setHeader('Content-Type', 'application/json')
        response.json({result: result.toString()})
        response.status(200).end()
    } catch(error) {
        LOGGER.log('error', 'Impossible to create the business card of \'' + request.session.user + '\' because:\n' + error)
        response.status(500).end('Impossible to create business card')
    }
})

app.post('/businesscard/update', async (request, response) => {
    LOGGER.log('info', 'request POST /businesscard/update called')
    
    if(request.session.user != undefined) {
        request.session.cookie.expires = utils.initExpireCookie()
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

app.get('/label/search', async (request, response) => {
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

app.post('/label/add', async (request, response) => {
    LOGGER.log('info', 'request POST /label/add called')

    // Check the user session
    if(request.session.user != undefined) {
        request.session.cookie.expires = utils.initExpireCookie()
    } else {
        LOGGER.log('warn', 'No session loaded to add a label')
        response.status(401).end('The user is not logged')
        return
    }

    let data = request.body
    // If no label well we can't add a new competency...
    if(undefined === data.name || data.name.length < 3) {
        response.status(400).end("Impossible to add an empty label")
        return
    }

    let user = new User()
    // Need user infos to link this one with a new label
    try {
        user = await User.getUserByLogin(request.session.user)
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

app.get('/label/delete', async (request, response) => {
    LOGGER.log('info', 'request GET /label/delete called')

    // Check the user session
    if(request.session.user != undefined) {
        request.session.cookie.expires = utils.initExpireCookie()
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

app.listen(8081)