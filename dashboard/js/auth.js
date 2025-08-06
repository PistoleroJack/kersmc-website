// auth.js
const auth0Domain = "kersmc.eu.auth0.com";
const auth0ClientId = "OtaKg92TfevmL5KR18EsAgwdSxjOZC6A"; // <-- Vul jouw Client ID in
const requiredRoles = ["owner", "admin", "vip", "speler"]; // Pas aan indien nodig

let auth0Client;

async function initAuth0() {
  auth0Client = await createAuth0Client({
    domain: auth0Domain,
    client_id: auth0ClientId,
    cacheLocation: "localstorage",
    useRefreshTokens: true
  });

  const isAuthenticated = await auth0Client.isAuthenticated();

  if (!isAuthenticated) {
    return auth0Client.loginWithRedirect({
      redirect_uri: window.location.origin + window.location.pathname,
    });
  }

  const tokenClaims = await auth0Client.getIdTokenClaims();
  const roles = tokenClaims["https://kersmc.nl/roles"] || [];

  const hasAccess = roles.some(role => requiredRoles.includes(role));

  if (!hasAccess) {
    window.location.href = "/dashboard/wachten.html";
  }
}

window.onload = () => {
  initAuth0();
};
