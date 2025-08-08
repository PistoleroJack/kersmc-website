// /dashboard/js/auth.js
(async () => {
  // Config
  const AUTH0_DOMAIN = "kersmc.eu.auth0.com";
  const AUTH0_CLIENT_ID = "OtaKg92TfevmL5KR18EsAgwdSxjOZC6A";

  // Uitzonderingen
  const EXCEPTIONS = [
    "/dashboard/wachten.html", "/dashboard/wachten",
    "/dashboard/fout.html", "/dashboard/fout",
    "/dashboard/callback.html"
  ];

  function isException(path) {
    const clean = path.replace(/\/+$/, '');
    return EXCEPTIONS.some(e => clean === e.replace(/\/+$/, ''));
  }

  function requiredRole(path) {
    const p = path.toLowerCase();
    if (p.includes("/dashboard/owner")) return "owner";
    if (p.includes("/dashboard/admin")) return "admin";
    if (p.includes("/dashboard/omega")) return "omega";
    if (p.includes("/dashboard/speler")) return "speler";
    return "speler";
  }

  // Wacht tot Auth0 SDK geladen is
  while (typeof createAuth0Client === "undefined") {
    await new Promise(r => setTimeout(r, 50));
  }

  let auth0;
  try {
    auth0 = await createAuth0Client({
      domain: AUTH0_DOMAIN,
      client_id: AUTH0_CLIENT_ID,
      cacheLocation: "localstorage",
      useRefreshTokens: true
    });
    window.__auth0Client = auth0; // voor debug
  } catch (err) {
    console.error("Auth0 init failed:", err);
    return;
  }

  const path = window.location.pathname;

  // Sla uitzonderingen over
  if (isException(path)) {
    attachLogout();
    return;
  }

  try {
    const isAuth = await auth0.isAuthenticated();
    if (!isAuth) {
      const returnTo = path + window.location.search + window.location.hash;
      window.location.replace(`/login.html?returnTo=${encodeURIComponent(returnTo)}`);
      return;
    }

    const claims = await auth0.getIdTokenClaims();
    const roles = (claims && claims["https://kersmc.nl/roles"]) || [];
    const needRole = requiredRole(path);

    if (!roles.includes(needRole)) {
      window.location.replace("/dashboard/wachten.html");
      return;
    }

    attachLogout();
    const user = await auth0.getUser();
    const el = document.getElementById("auth-username");
    if (el && user) el.textContent = user.name || user.email || "";
  } catch (err) {
    console.error("Auth check error:", err);
    window.location.replace("/dashboard/fout.html");
  }

  function attachLogout() {
    const btn = document.getElementById("logout-btn");
    if (!btn) return;
    btn.addEventListener("click", async e => {
      e.preventDefault();
      try {
        await auth0.logout({ logoutParams: { returnTo: window.location.origin } });
      } catch {
        window.location.href = `https://${AUTH0_DOMAIN}/v2/logout?client_id=${AUTH0_CLIENT_ID}&returnTo=${encodeURIComponent(window.location.origin)}`;
      }
    });
  }
})();
