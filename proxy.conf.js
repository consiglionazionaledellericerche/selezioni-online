/**
 * Proxy di sviluppo (ng serve): /openapi, /rest, /security e /sso al backend.
 * Il link di attivazione della mail di registrazione (/rest/security/confirm-account) resta ad Angular,
 * che lo conferma con /openapi/v1/user/confirm-account.
 */
const config = {
  "/openapi": {
    "target": "http://localhost:5555",
    "secure": false,
    "changeOrigin": true
  },
  "/rest": {
    "target": "http://localhost:5555",
    "secure": false,
    "changeOrigin": true
  },
  "/security": {
    "target": "http://localhost:5555",
    "secure": false,
    "changeOrigin": true
  },
  "/sso": {
    "target": "http://localhost:5555",
    "secure": false,
    "changeOrigin": true
  }
};

config['/rest'].bypass = (req) => req.url.startsWith('/rest/security/confirm-account') ? '/index.html' : undefined;

module.exports = config;
