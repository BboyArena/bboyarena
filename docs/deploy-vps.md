# Deploy VPS

Guida operativa per pubblicare `apps/server` su una VPS con Docker e Traefik gia installati.

Obiettivo:

```text
https://bboyarena.org
  -> GitHub Pages

https://api.bboyarena.org
  -> VPS
  -> Traefik
  -> apps/server
  -> PocketBase interno
```

PocketBase non deve essere esposto pubblicamente.

## Prerequisiti

- VPS con Docker e Docker Compose.
- Traefik gia attivo sulla VPS.
- Traefik collegato a una rete Docker esterna, per esempio `proxy`.
- DNS configurabile per `api.bboyarena.org`.
- Accesso SSH alla VPS.

Verifica rete Traefik:

```bash
sudo docker network ls
```

Prendi nota del nome rete, per esempio:

```text
proxy
traefik
traefik_proxy
```

## DNS

Nel provider DNS:

```text
A api.bboyarena.org -> IP_DELLA_VPS
```

Il dominio principale puo restare su GitHub Pages:

```text
bboyarena.org
www.bboyarena.org
```

## Checkout

Sulla VPS:

```bash
git clone git@github.com:BboyArena/bboyarena.git
cd bboyarena
git checkout feature/server
```

Quando il branch sara mergiato, usa il branch principale.

## Configurazione Env

```bash
cp .env.example .env
nano .env
```

Valori minimi:

```env
API_HOST=api.bboyarena.org
PUBLIC_API_URL=https://api.bboyarena.org

TRAEFIK_NETWORK=proxy
TRAEFIK_HTTPS_ENTRYPOINT=websecure
TRAEFIK_CERT_RESOLVER=letsencrypt

POCKETBASE_IMAGE=ghcr.io/muchobien/pocketbase:0.39.6
JWT_SECRET=replace-with-a-long-random-secret

EMAIL_PROVIDER=noop
EMAIL_FROM=noreply@bboyarena.org
EMAIL_REPLY_TO=info@bboyarena.org
RESEND_API_KEY=
BREVO_API_KEY=
```

Genera un secret:

```bash
openssl rand -base64 48
```

## Avvio Produzione

Il file base `docker-compose.yml` resta utile per sviluppo locale.

In produzione usa anche l'override:

```bash
sudo docker compose -f docker-compose.yml -f docker-compose.prod.yml up -d --build
```

Con questo override:

- `api` non pubblica porte host;
- `api` viene esposta solo da Traefik;
- `pocketbase` non pubblica porte host;
- `pocketbase` resta raggiungibile solo dalla rete Docker interna;
- Traefik ottiene il certificato HTTPS per `api.bboyarena.org`.

## Migration PocketBase

Le migration sono montate in:

```text
/pb_migrations
```

Applica manualmente:

```bash
sudo docker compose -f docker-compose.yml -f docker-compose.prod.yml run --rm pocketbase migrate up --dir=/pb_data --migrationsDir=/pb_migrations
```

Poi riavvia:

```bash
sudo docker compose -f docker-compose.yml -f docker-compose.prod.yml up -d --build
```

## Verifica

API:

```bash
curl https://api.bboyarena.org/health
```

Registrazione, finche le rotte hanno ancora prefisso `/api`:

```bash
curl -X POST https://api.bboyarena.org/api/register \
  -H "content-type: application/json" \
  -d '{"email":"player@example.com","username":"playername","password":"password123","passwordConfirm":"password123","privacyPolicyAccepted":true,"termsAccepted":true,"newsletterOptIn":false}'
```

Login:

```bash
curl -X POST https://api.bboyarena.org/api/login \
  -H "content-type: application/json" \
  -d '{"email":"player@example.com","password":"password123"}'
```

## Website GitHub Pages

Nel deploy del website imposta:

```env
PUBLIC_API_URL=https://api.bboyarena.org
```

Le pagine signup/signin/profile chiameranno la VPS.

## Log

```bash
sudo docker compose -f docker-compose.yml -f docker-compose.prod.yml logs -f api
sudo docker compose -f docker-compose.yml -f docker-compose.prod.yml logs -f pocketbase
```

## Backup PocketBase

Trova il nome volume:

```bash
sudo docker volume ls | grep pocketbase_data
```

Backup:

```bash
mkdir -p backups

sudo docker run --rm \
  -v bboyarena_pocketbase_data:/data:ro \
  -v "$(pwd)/backups:/backup" \
  alpine tar czf /backup/pocketbase-data-$(date +%F).tar.gz -C / data
```

Se il volume ha un nome diverso, sostituisci `bboyarena_pocketbase_data`.

## Aggiornamento

```bash
git pull
sudo docker compose -f docker-compose.yml -f docker-compose.prod.yml up -d --build
sudo docker compose -f docker-compose.yml -f docker-compose.prod.yml run --rm pocketbase migrate up --dir=/pb_data --migrationsDir=/pb_migrations
sudo docker compose -f docker-compose.yml -f docker-compose.prod.yml up -d
```

## Note

- Non usare `latest` per PocketBase.
- Non esporre PocketBase pubblicamente salvo necessita temporanea e protetta.
- Per accesso admin PocketBase in produzione, preferisci SSH tunnel, VPN o allowlist IP.
- Il prossimo cleanup consigliato e rimuovere il prefisso `/api` dalle route, visto che il servizio vive gia su `api.bboyarena.org`.

