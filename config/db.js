let mysql = require('mysql');
let LOGGER = require('./logger');

let connection = mysql.createPool({
    connectionLimit : 10,
    // Mode docker
    host     : 'db',
    // Mode local
    //host     : 'localhost',
    user     : 'root',
    password : 'password',
    database : 'my_cv'
});
 
/*connection.connect(err => {
    if (err) {
        LOGGER.log('error', 'error connecting: ' + err.stack);
        console.error('error connecting: ' + err.stack);
        return;
    }
 
    LOGGER.log('info', 'connected as id ' + connection.threadId);
    console.log('connected as id ' + connection.threadId);
});*/

module.exports = connection