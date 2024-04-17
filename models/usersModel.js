const Datastore = require('nedb-promise');
const db = new Datastore({ filename: "database/database.db", autoload: true });

module.exports = db;