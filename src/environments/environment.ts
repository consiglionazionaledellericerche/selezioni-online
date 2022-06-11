export const environment = {
  production: false,
  apiUrl: window["env"]["apiUrl"] || "default",
  debug: window["env"]["debug"] || false,
  oidc: {
    enable: window["env"]["oidc.enable"] || "false",
    authority: window["env"]["oidc.authority"],
    redirectUrl: window["env"]["oidc.redirectUrl"],
    clientId: window["env"]["oidc.clientId"]
  }
};