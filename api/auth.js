const dispatch = require('../server_api/dispatch');

const handlers = {
  'create-session': require('../server_api/auth/create-session'),
};

module.exports = function handler(req, res) {
  return dispatch(req, res, handlers, 'auth');
};
