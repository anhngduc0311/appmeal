#!/usr/bin/env bash
set -euo pipefail
# Run on the appmeal VM after unpacking the reviewed release into /opt/appmeal.
cd /opt/appmeal/lcit-meal-api
sudo apt-get update -q
sudo env DEBIAN_FRONTEND=noninteractive apt-get -o DPkg::Lock::Timeout=300 install -y nodejs npm caddy
if ! id appmeal >/dev/null 2>&1; then sudo useradd --system --home /opt/appmeal --shell /usr/sbin/nologin appmeal; fi
sudo mkdir -p /opt/appmeal/lcit-meal-api/public/uploads
sudo chown -R appmeal:appmeal /opt/appmeal
sudo chmod 600 .env
sudo -u appmeal npm ci --omit=dev
sudo -u appmeal npm run migrate:postgres
sudo tee /etc/systemd/system/appmeal.service >/dev/null <<'UNIT'
[Unit]
Description=Appmeal API
After=network-online.target
Wants=network-online.target

[Service]
Type=simple
User=appmeal
Group=appmeal
WorkingDirectory=/opt/appmeal/lcit-meal-api
Environment=NODE_ENV=production
EnvironmentFile=/opt/appmeal/lcit-meal-api/.env
ExecStart=/usr/bin/node src/server.js
Restart=on-failure
RestartSec=5
NoNewPrivileges=true
PrivateTmp=true
ProtectSystem=strict
ProtectHome=true
ReadWritePaths=/opt/appmeal/lcit-meal-api/public/uploads
UMask=0077

[Install]
WantedBy=multi-user.target
UNIT
sudo systemctl daemon-reload
sudo systemctl enable --now appmeal
curl --retry 10 --retry-delay 2 --retry-connrefused --fail --silent http://127.0.0.1:3000/healthz
