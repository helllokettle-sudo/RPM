# RPM Customs — presentation prototype

Public demo destination: https://rpm.devisellp.com

This repository contains the reviewed website prototype, editable source and a lightweight Nginx container for deployment through Coolify on the existing OVH VPS.

## Deploy in Coolify

- Repository: `https://github.com/helllokettle-sudo/RPM`, branch `main`.
- Build pack: **Dockerfile**; build context `/`; Dockerfile `/Dockerfile`.
- Application domain: `https://rpm.devisellp.com`.
- Internal application port: **80**. No host port mapping is required.
- Health check: `GET /healthz`, port 80, expected status 200.
- No environment variables, database, Node runtime or persistent volume is needed.

The Docker build copies the committed `dist` files; it installs no Node dependencies on the server. The reverse proxy manages HTTPS and HTTP redirects. DNS for the `rpm` subdomain must point to the OVH VPS.

## Local development

```sh
npm install
npm run build
node --test tools/config.test.mjs
python3 -m http.server 8765 --bind 127.0.0.1 --directory dist
```

Open http://127.0.0.1:8765/#home or http://127.0.0.1:8765/#build.

Commit regenerated `dist` alongside source changes, then redeploy the new commit in Coolify. HTML and scripts revalidate their cache on each request to keep split module versions consistent.

## Demo boundaries

129 model/generation choices span BMW, Mercedes-Benz, Audi, Volkswagen, Porsche, Lamborghini, Tesla, Toyota and Nissan. The viewer combines procedural 3D wheel geometry and photographic details with nine representative concept cabins. These are not 129 exact scanned vehicle interiors. Model years, trims, fitment and NOK prices require RPM approval before production use. Saved builds stay in the browser; share links embed their configuration. No order, payment or enquiry is submitted.

Original high-resolution design files, proposal documents and local QA screenshots are excluded from the server container. Third-party Three.js code is MIT licensed; see `dist/THREE-LICENSE.txt`. Image origins and generation specifications are documented in `docs/ASSET-PROVENANCE.md` (original source photographs remain in the local design workspace). Client and vehicle branding remain associated with their respective owners.

A Shopify theme/app extension, verified product/variant pricing and model-specific production assets are subsequent implementation work.
