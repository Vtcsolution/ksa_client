#!/usr/bin/env bash
# Deploys the Omnira ONE project (CRM + Website) onto this VPS under
# greatowear.com, alongside the existing sites in /var/www — does not touch
# any of them. Run as root on the VPS itself (paste this whole file into a
# new file there and run it, or scp it up).
#
# Safe by construction:
#   - clones into a NEW /var/www/greatowear directory (no existing folder
#     has that name)
#   - pm2 app names (omnira-crm*, omnira-website*) don't collide with the
#     existing backend / greatodeal-backend / greatodeal-frontend processes
#   - writes NEW nginx server-block files; never edits an existing one
#   - uses `nginx -t` before every reload, and `reload` (graceful) not
#     `restart` (which would drop connections to your other live sites)
#
# Before running: fix REPO_URL below if the GitHub repo is private (see the
# comment on that line), and double-check the port check step doesn't find
# 3417/3500 already in use by something else.

set -euo pipefail

REPO_URL="https://github.com/Vtcsolution/ksa_client.git"
# ^ if this repo is private, either:
#   REPO_URL="https://<PAT>@github.com/Vtcsolution/ksa_client.git"   (personal access token)
#   or set up a deploy key and use the git@github.com:... SSH form instead.

APP_DIR="/var/www/greatowear"
DOMAIN_WEBSITE_1="greatowear.com"
DOMAIN_WEBSITE_2="www.greatowear.com"
DOMAIN_CRM="api.greatowear.com"

echo "== 1/8: checking ports 3417 / 3500 are free =="
if ss -tlnp 2>/dev/null | grep -qE ':(3417|3500)\s'; then
  echo "!! Port 3417 or 3500 is already in use by something else on this VPS. Stop here and pick different ports (edit ecosystem.config.js's PORT values, and the nginx configs below, to match) before continuing." >&2
  ss -tlnp | grep -E ':(3417|3500)\s' || true
  exit 1
fi
echo "OK — both ports free."

echo "== 2/8: cloning repo into $APP_DIR =="
if [ -d "$APP_DIR" ]; then
  echo "!! $APP_DIR already exists — not overwriting. Remove it first if you want a clean clone, or cd in and 'git pull' instead." >&2
  exit 1
fi
git clone "$REPO_URL" "$APP_DIR"
cd "$APP_DIR"

echo "== 3/8: install + build (omnira-crm) =="
cd "$APP_DIR/omnira-crm"
npm install
echo ">> Now create $APP_DIR/omnira-crm/.env.local with your real production values"
echo ">> (copy from your local machine's omnira-crm/.env.local — update WEBSITE_URL"
echo ">>  to https://$DOMAIN_WEBSITE_1 once the Website side is live too)."
read -rp "Press Enter once omnira-crm/.env.local is in place... "
npm run build

echo "== 4/8: install + build (Website) =="
cd "$APP_DIR/Website"
npm install
echo ">> Now create $APP_DIR/Website/.env.local with your real production values"
echo ">> (copy from your local machine's Website/.env.local — update CRM_URL to"
echo ">>  https://$DOMAIN_CRM)."
read -rp "Press Enter once Website/.env.local is in place... "
npm run build

echo "== 5/8: starting pm2 processes =="
cd "$APP_DIR"
pm2 start ecosystem.config.js
pm2 save

echo "== 6/8: writing nginx server blocks (HTTP first, certbot adds SSL next) =="
cat > /etc/nginx/sites-available/greatowear-website.conf <<NGINX
server {
    listen 80;
    listen [::]:80;
    server_name ${DOMAIN_WEBSITE_1} ${DOMAIN_WEBSITE_2};

    location / {
        proxy_pass http://127.0.0.1:3500;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
        proxy_cache_bypass \$http_upgrade;
    }
}
NGINX

cat > /etc/nginx/sites-available/greatowear-crm.conf <<NGINX
server {
    listen 80;
    listen [::]:80;
    server_name ${DOMAIN_CRM};

    location / {
        proxy_pass http://127.0.0.1:3417;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
        proxy_cache_bypass \$http_upgrade;
    }
}
NGINX

ln -sf /etc/nginx/sites-available/greatowear-website.conf /etc/nginx/sites-enabled/greatowear-website.conf
ln -sf /etc/nginx/sites-available/greatowear-crm.conf /etc/nginx/sites-enabled/greatowear-crm.conf

nginx -t
systemctl reload nginx
echo "OK — nginx serving both domains over HTTP."

echo "== 7/8: SSL via certbot =="
if ! command -v certbot >/dev/null 2>&1; then
  apt-get update && apt-get install -y certbot python3-certbot-nginx
fi
certbot --nginx -d "$DOMAIN_WEBSITE_1" -d "$DOMAIN_WEBSITE_2" -d "$DOMAIN_CRM"

echo "== 8/8: verifying =="
pm2 list
curl -sk -o /dev/null -w "https://$DOMAIN_WEBSITE_1 -> %{http_code}\n" "https://$DOMAIN_WEBSITE_1"
curl -sk -o /dev/null -w "https://$DOMAIN_CRM -> %{http_code}\n" "https://$DOMAIN_CRM"

echo "Done. Both apps should now be live over HTTPS."
