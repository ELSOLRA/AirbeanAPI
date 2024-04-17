const Datastore = require('nedb-promise');
const ordersDb = new Datastore ({ filename: "database/orders.db", autoload: true });

module.exports = ordersDb;