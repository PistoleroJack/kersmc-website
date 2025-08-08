// /dashboard/js/auth.js
// Zet dit script met <script src="/dashboard/js/auth.js" defer></script> in ALLE pagina's onder /dashboard/
// (zorg dat de Auth0 SDK boven dit script geladen is:
//  <script src="https://cdn.auth0.com/js/auth0-spa-js/2.0/auth0-spa-js.production.js"></script> )

(async () => {
  // ---------- Config (wijzig hier alleen als nodig) ----------
  const AUTH0_DOMAIN = "kersmc.eu.auth0.com";
  const AUTH0_CLIENT_ID = "OtaKg92TfevmL5KR18EsAgwdSxjOZC6A";
  // ---------- Einde config ------------------------------------

  // Paden die WEL publiek mogen blijven onder /dashboard
  const EXCEPTIONS = [
    "/dashboard/wachten.html", "/dashboard/wachten",
    "/dashboard/fout.html", "/dashboard/fout",
    "/dashboard/callback.html" // callback pagina moet bereikbaar zijn
  ];

  // helper: zit het pad in exceptions?
  function isExceptionPath(path) {
    return EXCEPTIONS.some(e => e === path || path === e + ".html");
  }

  // helper: bepaal welke rol nodig is voor deze pagina (pas aan als je andere mappen gebruikt)
  function vereisteRolVoorPad(pathname) {
    if (pathname.startsWith("/dashboard/owner/") || pathname === "/dashboard/owner" || pathname === "/dashboard/owner.html") {
      return "owner";
    }
    if (pathname.startsWith("/dashboard/admin/") || pathname === "/dashboard/admin" || pathname === "/dashboard/admin.html") {
      return "admin";
    }
    if (pathname.startsWith("/dashboard/omega/") || pathname === "/dashboard/omega" || pathname === "/dashboard/omega.html") {
      return "omega";
    }
    if (pathname.startsWith("/dashboard/speler/") || pathname === "/dashboard/speler" || pathname === "/dashboard/speler.html") {
      return "speler";
    }
    // Algemene dashboard pagina's (index of andere) zijn minimaal 'speler'
    return "speler";
  }

  // Maak Auth0 client
  const auth0 = await createAuth0Client({
    domain: AUTH0_DOMAIN,
    client_id: AUTH0_CLIENT_ID,
    cacheLocation: "localstorage",
    useRefreshTokens: true
  });

  const pathname = window.location.pathname;

  // Als dit een exception pad is: stop (geen redirect)
  if (isExceptionPath(pathname)) {
    return;
  }

  // Als url parameters "code" + "state" heeft en we op callback zitten, laat callback pagina afhandelen.
  // (Deze file hoeft niet de callback af te handelen — dat doet /dashboard/callback.html)
  // => Toch checken we dit om dubbele afhandeling te voorkomen:
  if (pathname === "/dashboard/callback.html") {
    return;
  }

  // 1) Als gebruiker niet ingelogd is: stuur naar /login.html?returnTo=<huidigPad>
  const isAuthenticated = await auth0.isAuthenticated();
  if (!isAuthenticated) {
    const returnTo = window.location.pathname + window.location.search;
    // Stuur naar login met returnTo param (login.html zal de redirect naar Auth0 starten)
    window.location.replace(`/login.html?returnTo=${encodeURIComponent(returnTo)}`);
    return;
  }

  // 2) Als ingelogd: haal token en rollen op
  const idClaims = await auth0.getIdTokenClaims();
  // Verwachte custom claim namespace: https://kersmc.nl/roles
  const roles = (idClaims && idClaims["https://kersmc.nl/roles"]) || [];

  // 3) Controleer rol
  const vereisteRol = vereisteRolVoorPad(pathname);

  // 'speler' is standaard toegestaan (als je wilt dat sommige pagina's helemaal geen rol nodig hebben,
  // verander de return van vereisteRolVoorPad)
  if (!roles.includes(vereisteRol)) {
    // geen toegang: stuur naar wachten
    window.location.replace("/dashboard/wachten.html");
    return;
  }

  // Toegang toegestaan — je kan hier optioneel UI aanpassen (bijv. naam tonen).
  try {
    const user = await auth0.getUser();
    // Plaats een klein element met gebruikersnaam als je wilt (zorg dat element in DOM bestaat)
    const el = document.getElementById("auth-username");
    if (el && user && (user.name || user.email)) {
      el.textContent = user.name || user.email;
    }
    // Optioneel: voeg logout knop functionaliteit toe als er een element met id="logout-btn" bestaat
    const logoutBtn = document.getElementById("logout-btn");
    if (logoutBtn) {
      logoutBtn.addEventListener("click", () => {
        auth0.logout({
          logoutParams: {
            returnTo: window.location.origin + "/" // na logout naar homepage
          }
        });
      });
    }
  } catch (err) {
    console.warn("Auth UI update faalde:", err);
  }
})();
