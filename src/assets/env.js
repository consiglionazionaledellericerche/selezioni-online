(function(window) {
    window["env"] = window["env"] || {};
  
    // Environment variables
    window["env"]["apiUrl"] = "http://localhost:8080";
    window["env"]["production"] = false;
    window["env"]["oidc.enable"] = "true";
    window["env"]["oidc.authority"] = "https://sso.cnr.it/auth/realms/CNR";
    window["env"]["oidc.redirectUrl"] = "http://localhost:4200/auth/signin";
    window["env"]["oidc.clientId"] = "angular-public";
  })(this);
