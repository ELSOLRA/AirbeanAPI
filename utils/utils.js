const moment = require('moment');

// Skapar ordernummer
function orderNr() {
    var letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    var digits = '0123456789';
    var result = '';
    
    for (var i = 0; i < 3; i++) {
        result += letters.charAt(Math.floor(Math.random() * letters.length));
    }
    for (var i = 0; i < 7; i++) {
        result += digits.charAt(Math.floor(Math.random() * digits.length));
    }
    return result;
}
// Tidsberäkning med moment
function calculateRemainingTime(order) {
    const { eta, timestamp } = order;
    const orderTime = moment(timestamp);
    const currentTime = moment();
    const elapsedTime = currentTime.diff(orderTime, 'minutes'); 
    const remainingTime = Math.max(eta - elapsedTime, 0); 
  
    return remainingTime;
  }

module.exports = {
    orderNr,
    calculateRemainingTime
}