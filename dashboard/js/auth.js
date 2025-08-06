// /dashboard/js/auth.js

const auth0 = await createAuth0Client({
  domain: "kersmc.eu.auth0.com",
  client_id: "OtaKg92TfevmL5KR18EsAgwdSxjOZC6A",
  cacheLocation: "localstorage",
  useRefreshTokens: true
});

const isAuthenticated = await auth0.isAuthenticated();

if (!isAuthenticated) {
  // Als gebruiker niet is ingelogd, start login
  await auth0.loginWithRedirect({
    redirect_uri: window.location.href
  });
} else {
  const user = await auth0.getUser();
  const token = await auth0.getIdTokenClaims();
  const roles = token["https://kersmc.nl/roles"] || [];

  // Automatisch toegang voor "speler"
  const extraToegestaan = "speler";

  // Welke rol is vereist op deze pagina?
  const vereisteRol = bepaalRolVoorPagina();

  if (!roles.includes(vereisteRol) && vereisteRol !== extraToegestaan) {
    window.location.href = "/dashboard/wachten.html";
  }

  // ✅ Gebruiker mag blijven
}

// Deze functie bepaalt de juiste rol op basis van de URL
function bepaalRolVoorPagina() {
  const path = window.location.pathname;

  if (path.includes("/dashboard/owner/")) return "owner";
  if (path.includes("/dashboard/admin/")) return "admin";
  if (path.includes("/dashboard/omega/")) return "omega";
  if (path.includes("/dashboard/speler/")) return "speler";
  
  // Geen specifieke rol nodig
  return "speler"; // fallback
}
