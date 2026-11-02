# Appmeal on Google Cloud

Target: VM `appmeal`, zone `asia-southeast1-c`, project `project-5478c3b3-05cd-4d6a-bce`.
Web: `https://appmeal.34.126.188.117.sslip.io`; API: same origin under `/api`.

The API selects PostgreSQL when `DATABASE_URL` is configured. Neon credentials and
`JWT_SECRET` belong in `/opt/appmeal/lcit-meal-api/.env` (mode 600); never commit them.
The API listens on localhost port 3000; Caddy provides HTTPS and static web files.

For a new database, run `npm run migrate:postgres`, then run `npm run bootstrap:admin`
once with a unique `INITIAL_ADMIN_PASSWORD` environment variable of at least 16
characters. Remove that variable after bootstrap. No demo accounts are created.
Automatic meal registration starts disabled until staff and schedules are configured.

Export the web client with `npx expo export --platform web --output-dir dist` from
`lcit-meal-mobile`, copy its contents to `/opt/appmeal/web`, and copy the API and
deployment files under `/opt/appmeal`. Run `deploy/install-appmeal.sh`, then install
`deploy/Caddyfile` as `/etc/caddy/Caddyfile` and reload Caddy.

Verify `/healthz`, login, and authenticated API requests after every deployment.
Inspect service logs with `journalctl -u appmeal` and `journalctl -u caddy`.
Run `npm run test:postgres` to test against a disposable schema on Neon's direct
endpoint; it does not change production records. Run the client's typecheck, lint,
and tests before exporting a new web build.

The external IP is reserved as `appmeal-ip` in region `asia-southeast1`.
Keep this reservation when stopping or replacing the VM so the hostname stays valid.
