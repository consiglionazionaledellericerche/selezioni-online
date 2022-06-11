(function(window) {
    window.env = window.env || {};
  
    // Environment variables
    window["env"]["apiUrl"] = "${API_URL}";
    window["env"]["oidc.enable"] = "${OIDC_ENABLE}";
    window["env"]["oidc.authority"] = "${OIDC_AUTHORITY}";
    window["env"]["oidc.redirectUrl"] = "${OIDC_REDIRECTURL}";
    window["env"]["oidc.clientId"] = "${OIDC_CLIENTID}";
})(this);