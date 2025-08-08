// /dashboard/js/auth.js
(async () => {
  const AUTH0_DOMAIN = "kersmc.eu.auth0.com";
  const AUTH0_CLIENT_ID = "OtaKg92TfevmL5KR18EsAgwdSxjOZC6A";

  const EXCEPTIONS = [
    "/dashboard/wachten.html", "/dashboard/wachten",
    "/dashboard/fout.html", "/dashboard/fout",
    "/dashboard/callback.html"
  ];

  function isExceptionPath(path) {
    const p = path.replace(/\/+$/, '');
    return EXCEPTIONS.some(e => p === e.replace(/\/+$/, ''));
  }

  function requiredRoleForPath(pathname) {
    const p = pathname.toLowerCase();
    if (p.includes("/dashboard/owner")) return "owner";
    if (p.includes("/dashboard/admin")) return "admin";
    if (p.includes("/dashboard/omega")) return "omega";
    if (p.includes("/dashboard/speler")) return "speler";
    return "speler";
  }

  // Wacht tot SDK geladen is
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
    window.__auth0Client = auth0; // handig voor debug
  } catch (err) {
    console.error("Auth0 init failed:", err);
    return;
  }

  const pathname = window.location.pathname;

  if (isExceptionPath(pathname)) {
    attachLogout();
    return;
  }

  try {
    const isAuthenticated = await auth0.isAuthenticated();
    if (!isAuthenticated) {
      const returnTo = window.location.pathname + window.location.search + window.location.hash;
      window.location.replace(`/login.html?returnTo=${encodeURIComponent(returnTo)}`);
      return;
    }

    const claims = await auth0.getIdTokenClaims();
    const roles = (claims && claims["https://kersmc.nl/roles"]) || [];
    const requiredRole = requiredRoleForPath(pathname);

    if (!roles.includes(requiredRole)) {
      window.location.replace("/dashboard/wachten.html");
      return;
    }

    attachLogout();
    try {
      const user = await auth0.getUser();
      const el = document.getElementById("auth-username");
      if (el && user) el.textContent = user.name || user.email || "";
    } catch(e){}
  } catch (err) {
    console.error("Auth check error:", err);
    window.location.replace("/dashboard/fout.html");
  }

  function attachLogout() {
    const logoutBtn = document.getElementById("logout-btn");
    if (!logoutBtn) return;
    logoutBtn.addEventListener("click", async (e) => {
      e.preventDefault();
      try {
        await auth0.logout({ logoutParams: { returnTo: window.location.origin } });
      } catch (err) {
        // fallback
        window.location.href = `https://${AUTH0_DOMAIN}/v2/logout?client_id=${AUTH0_CLIENT_ID}&returnTo=${encodeURIComponent(window.location.origin)}`;
      }
    });
  }
})();
