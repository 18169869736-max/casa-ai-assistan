const dispatch = require('../server_api/dispatch');

const handlers = {
  stats: require('../server_api/usage/stats'),
};

module.exports = function handler(req, res) {
  return dispatch(req, res, handlers, 'usage');
};
