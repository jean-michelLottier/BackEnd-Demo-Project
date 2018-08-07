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
let Utils           = require('./utils/utils')
let labelRouting    = require('./routing/labels.routing')
let businessCardRouting = require('./routing/businesscard.routing')
let accountRouting  = require('./routing/account.routing')
let itemRouting     = require('./routing/item.routing')

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

// Routing
app.use('/account', accountRouting)
app.use('/:lang/businesscard', businessCardRouting)
app.use('/label', labelRouting)
app.use('/item', itemRouting)

app.get('/:lang/education', (request, response) => {
    LOGGER.log('info', 'request GET /education called')
    
    if(request.session.user != undefined) {
        request.session.cookie.expires = Utils.initExpireCookie()
    } else {
        LOGGER.log('warn', 'No session loaded to access the education category')
        response.status(401).end('The user is not logged')
        return
    }

    let language = Utils.checkLanguage(request.params.lang)

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
        request.session.cookie.expires = Utils.initExpireCookie()
    } else {
        LOGGER.log('warn', 'No session loaded to access the professional experience category')
        response.status(401).end('The user is not logged')
        return
    }

    let language = Utils.checkLanguage(request.params.lang)

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
        request.session.cookie.expires = Utils.initExpireCookie()
    } else {
        LOGGER.log('warn', 'No session loaded to access the hobby category')
        response.status(401).end('The user is not logged')
        return
    }

    let language = Utils.checkLanguage(request.params.lang)

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

app.listen(8081)