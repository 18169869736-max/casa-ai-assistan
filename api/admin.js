const dispatch = require('../server_api/dispatch');

const handlers = {
  'admin-data': require('../server_api/admin-data'),
  'backfill-profiles': require('../server_api/admin/backfill-profiles'),
  'check-admin': require('../server_api/admin/check-admin'),
  'get-usage-stats': require('../server_api/admin/get-usage-stats'),
  'get-users': require('../server_api/admin/get-users'),
  'toggle-active': require('../server_api/admin/toggle-active'),
  'toggle-premium': require('../server_api/admin/toggle-premium'),
};

module.exports = function handler(req, res) {
  return dispatch(req, res, handlers, 'admin');
};
