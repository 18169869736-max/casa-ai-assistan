const dispatch = require('../server_api/dispatch');

const handlers = {
  cancel: require('../server_api/subscription/cancel'),
  create: require('../server_api/subscription/create'),
  'create-simple-plan': require('../server_api/subscription/create-simple-plan'),
  debug: require('../server_api/subscription/debug'),
  'list-locations': require('../server_api/subscription/list-locations'),
  'list-plans': require('../server_api/subscription/list-plans'),
  'setup-sandbox-plan': require('../server_api/subscription/setup-sandbox-plan'),
  'setup-trial-plan': require('../server_api/subscription/setup-trial-plan'),
  status: require('../server_api/subscription/status'),
  'verify-account': require('../server_api/subscription/verify-account'),
};

module.exports = function handler(req, res) {
  return dispatch(req, res, handlers, 'subscription');
};
