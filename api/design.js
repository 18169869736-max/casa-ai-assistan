const dispatch = require('../server_api/dispatch');

const handlers = {
  'generate-design': require('../server_api/generate-design'),
  'generate-design-custom': require('../server_api/generate-design-custom'),
  'regenerate-design': require('../server_api/regenerate-design'),
};

module.exports = function handler(req, res) {
  return dispatch(req, res, handlers, 'design');
};
