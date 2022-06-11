(function(window) {
    window["env"] = window["env"] || {};
  
    // Environment variables
    window["env"]["apiUrl"] = "http://cool-jconon.si.cnr.it";
    window["env"]["production"] = false;
    window["env"]["oidc.enable"] = "false";
    window["env"]["oidc.authority"] = "http://dockerwebtest02.si.cnr.it:8110/auth/realms/cnr/.well-known/openid-configuration";
    window["env"]["oidc.redirectUrl"] = "http://150.146.24.22:4200/auth/signin";
    window["env"]["oidc.clientId"] = "selezioni";
  })(this);