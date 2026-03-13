const dispatch = require('../server_api/dispatch');

const handlers = {
  square: require('../server_api/webhooks/square'),
  stripe: require('../server_api/webhooks/stripe'),
};

module.exports = function handler(req, res) {
  return dispatch(req, res, handlers, 'webhooks');
};
