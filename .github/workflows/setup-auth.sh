#!/bin/bash
set -eo pipefail

echo "=== Setup authentication ==="

# Controleer of Auth0 CLI geïnstalleerd is, anders installeren
if ! command -v auth0 &> /dev/null; then
  echo "Auth0 CLI niet gevonden, installeren..."
  curl -sSfL https://raw.githubusercontent.com/auth0/auth0-cli/main/install.sh | sh
  export PATH="$HOME/.auth0/bin:$PATH"
  echo "PATH bijgewerkt: $PATH"
else
  echo "Auth0 CLI gevonden: $(command -v auth0)"
fi

# Absolute pad naar Auth0 CLI bepalen
AUTH0_BIN=$(command -v auth0 || echo "$HOME/.auth0/bin/auth0")
if [ ! -x "$AUTH0_BIN" ]; then
  echo "Fout: Auth0 CLI kon niet worden gevonden of uitgevoerd."
  exit 1
fi

echo "Auth0 CLI pad: $AUTH0_BIN"

# Login bij Auth0
"$AUTH0_BIN" login \
  --domain "$AUTH0_DOMAIN" \
  --client-id "$AUTH0_CLIENT_ID" \
  --client-secret "$AUTH0_CLIENT_SECRET"

# Indien je een tenant moet selecteren
"$AUTH0_BIN" tenants use "$AUTH0_DOMAIN"

echo "=== Authenticatie afgerond ==="
