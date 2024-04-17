let loggedId;

function setLoggedId(id) {
  loggedId = id;
  return loggedId
}

function getLoggedId() {
  return loggedId;
}

module.exports = {
  setLoggedId,
  getLoggedId,
  loggedId,
};