function getHandler(moduleExports) {
  if (typeof moduleExports === 'function') {
    return moduleExports;
  }

  if (moduleExports && typeof moduleExports.default === 'function') {
    return moduleExports.default;
  }

  return null;
}

module.exports = async function dispatch(req, res, handlers, groupName) {
  const action = req.query?.action;

  if (!action) {
    return res.status(400).json({
      success: false,
      message: `Missing action for ${groupName} route`,
    });
  }

  const handler = getHandler(handlers[action]);

  if (!handler) {
    return res.status(404).json({
      success: false,
      message: `Unknown ${groupName} action: ${action}`,
    });
  }

  return handler(req, res);
};
