#!/usr/bin/env bash
set -euo pipefail

# -------- Required vars --------
# Set these before running:
# export APP_DOMAIN="example.com"
# export APP_REPO="https://github.com/your-user/your-repo.git"
# Optional:
# export APP_DIR="/home/ubuntu/app"
# export APP_PORT="4000"
# export APP_NAME="agency-backend"
# export ADMIN_EMAIL="admin@agency.local"
# export ADMIN_PASSWORD="admin123456"
# export JWT_SECRET="change-this"

APP_DOMAIN="${APP_DOMAIN:?APP_DOMAIN is required}"
APP_REPO="${APP_REPO:?APP_REPO is required}"
APP_DIR="${APP_DIR:-/home/ubuntu/app}"
APP_PORT="${APP_PORT:-4000}"
APP_NAME="${APP_NAME:-agency-backend}"
ADMIN_EMAIL="${ADMIN_EMAIL:-admin@agency.local}"
ADMIN_PASSWORD="${ADMIN_PASSWORD:-admin123456}"
JWT_SECRET="${JWT_SECRET:-change-this-in-production}"

echo "==> Installing system packages"
sudo apt update
sudo apt install -y nginx git curl certbot python3-certbot-nginx

if ! command -v node >/dev/null 2>&1; then
  echo "==> Installing Node.js 20"
  curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
  sudo apt install -y nodejs
fi

if ! command -v pm2 >/dev/null 2>&1; then
  echo "==> Installing PM2"
  sudo npm install -g pm2
fi

echo "==> Cloning/updating app"
if [ -d "$APP_DIR/.git" ]; then
  git -C "$APP_DIR" pull --rebase
else
  git clone "$APP_REPO" "$APP_DIR"
fi

cd "$APP_DIR"

echo "==> Installing dependencies and building"
npm install
npm run build

echo "==> Starting backend with PM2"
pm2 delete "$APP_NAME" >/dev/null 2>&1 || true
pm2 start backend/dist/index.js --name "$APP_NAME" --time --update-env
pm2 save
pm2 startup systemd -u "$USER" --hp "$HOME" >/tmp/pm2_startup.txt || true

echo "==> Writing backend environment"
cat > "$APP_DIR/backend/.env" <<EOF
PORT=$APP_PORT
JWT_SECRET=$JWT_SECRET
ADMIN_EMAIL=$ADMIN_EMAIL
ADMIN_PASSWORD=$ADMIN_PASSWORD
EOF

echo "==> Preparing nginx config"
sudo tee /etc/nginx/sites-available/agency >/dev/null <<EOF
server {
  listen 80;
  server_name $APP_DOMAIN www.$APP_DOMAIN;

  root $APP_DIR/frontend/dist;
  index index.html;
  client_max_body_size 25M;

  location / {
    try_files \$uri /index.html;
  }

  location /api/ {
    proxy_pass http://127.0.0.1:$APP_PORT/api/;
    proxy_http_version 1.1;
    proxy_set_header Upgrade \$http_upgrade;
    proxy_set_header Connection "upgrade";
    proxy_set_header Host \$host;
    proxy_set_header X-Real-IP \$remote_addr;
    proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Proto \$scheme;
  }

  location /uploads/ {
    proxy_pass http://127.0.0.1:$APP_PORT/uploads/;
    proxy_set_header Host \$host;
    proxy_set_header X-Real-IP \$remote_addr;
    proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Proto \$scheme;
  }
}
EOF

sudo ln -sfn /etc/nginx/sites-available/agency /etc/nginx/sites-enabled/agency
sudo rm -f /etc/nginx/sites-enabled/default
sudo nginx -t
sudo systemctl reload nginx

echo "==> Enabling HTTPS"
sudo certbot --nginx -d "$APP_DOMAIN" -d "www.$APP_DOMAIN" --non-interactive --agree-tos -m "admin@$APP_DOMAIN" || true

echo
echo "Deployment complete."
echo "Frontend: https://$APP_DOMAIN"
echo "Backend health check (if you add route): https://$APP_DOMAIN/api"
echo "PM2 status: pm2 ls"
