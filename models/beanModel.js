const Datastore = require('nedb-promise');
const menuDb = new Datastore({ filename: 'database/menu.db', autoload: true });

module.exports = menuDb;

