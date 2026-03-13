const dispatch = require('../server_api/dispatch');

const handlers = {
  'meta-track-event': require('../server_api/meta/track-event'),
  'pinterest-track-event': require('../server_api/pinterest/track-event'),
  'tiktok-track-event': require('../server_api/tiktok/track-event'),
};

module.exports = function handler(req, res) {
  return dispatch(req, res, handlers, 'tracking');
};
