# BboyArena Server

Backend API ufficiale di BboyArena.

L'obiettivo e mantenere game e website disaccoppiati dal provider dati:

```text
Game / Website
  -> packages/sdk
  -> apps/server
  -> repositories
  -> PocketBase adapter
  -> PocketBase
```

PocketBase e usato come database/auth/storage iniziale, ma non deve diventare il backend pubblico dell'app.

## Docker

Dal root del monorepo:

```bash
sudo docker compose up --build
```

Di default partono solo:

```text
api
pocketbase
```

URL locali:

```text
API:        http://localhost:8787
PocketBase: http://localhost:8060
```

Dentro Docker l'API parla con PocketBase tramite rete interna:

```env
POCKETBASE_URL=http://pocketbase:8090
```

La porta esterna di PocketBase puo essere cambiata senza toccare il compose:

```bash
POCKETBASE_PORT=8061 sudo docker compose up --build
```

## Versioni Formalizzate

PocketBase runtime e JS SDK sono volutamente pinnati.

```text
PocketBase server: ghcr.io/muchobien/pocketbase:0.39.6
PocketBase JS SDK: pocketbase@0.27.0
```

Non usare `latest` in produzione o sviluppo condiviso: PocketBase e ancora in evoluzione rapida e le migration/API possono cambiare tra release.

Per cambiare versione runtime in modo esplicito:

```bash
POCKETBASE_IMAGE=ghcr.io/muchobien/pocketbase:0.39.6 sudo docker compose up --build
```

Release ufficiale di riferimento:

```text
https://github.com/pocketbase/pocketbase/releases/tag/v0.39.6
```

## Endpoint

Health check:

```bash
curl http://localhost:8787/health
```

Registrazione:

```bash
curl -X POST http://localhost:8787/api/register \
  -H "content-type: application/json" \
  -d '{"email":"player@example.com","username":"playername","password":"password123","passwordConfirm":"password123","privacyPolicyAccepted":true,"termsAccepted":true,"newsletterOptIn":false}'
```

Login:

```bash
curl -X POST http://localhost:8787/api/login \
  -H "content-type: application/json" \
  -d '{"email":"player@example.com","password":"password123"}'
```

Utente corrente:

```bash
curl http://localhost:8787/api/me \
  -H "authorization: Bearer TOKEN_QUI"
```

## Auth Attuale

Le route auth reali sono:

```text
POST /api/register
POST /api/login
POST /api/logout
GET  /api/me
```

`POST /api/register`:

1. valida il body con Zod;
2. crea un record nella collection PocketBase `users`;
3. esegue subito login con email/password;
4. registra i consensi privacy/terms;
5. se richiesto, registra l'opt-in newsletter;
6. restituisce `{ token, user }`.

`POST /api/login` usa:

```ts
pb.collection("users").authWithPassword(email, password)
```

`GET /api/me` valida il token Bearer con:

```ts
pb.collection("users").authRefresh()
```

## Configurazione PocketBase

In locale aprire:

```text
http://localhost:8060
```

Serve una collection auth `users` con email/password abilitato.

Campi minimi usati oggi:

```text
id
email
username
created
```

## Privacy, GDPR e Newsletter

Nota: questa e una base tecnica, non consulenza legale. I testi di privacy policy, terms e newsletter vanno validati legalmente prima della produzione.

La registrazione richiede consenso esplicito per:

```text
privacyPolicyAccepted: true
termsAccepted: true
```

La newsletter e separata e opzionale:

```text
newsletterOptIn: false
```

Le collection PocketBase previste dalla migration sono:

```text
users
privacy_documents
user_consents
newsletter_subscriptions
```

`privacy_documents` conserva versioni e URL dei documenti legali:

```text
documentType: privacy_policy | terms | newsletter
version
title
url
effectiveAt
active
```

`user_consents` conserva la prova tecnica del consenso:

```text
user
documentType
documentVersion
accepted
source
ipAddress
userAgent
created
```

`newsletter_subscriptions` conserva lo stato newsletter separato dall'account:

```text
user
email
status: subscribed | unsubscribed
source
consentVersion
unsubscribedAt
```

La newsletter puo essere gestita anche per email non ancora collegate a un account. Per questo le migration successive rendono opzionale `user` e registrano comunque l'email nel consenso newsletter.

API newsletter gestite da `apps/server`:

```text
POST /api/newsletter/subscribe
POST /api/newsletter/unsubscribe
GET  /api/newsletter/status?email=
```

Provider email supportati lato server:

```text
noop
resend
brevo
```

Configurazione:

```env
EMAIL_PROVIDER=noop
EMAIL_FROM=noreply@bboyarena.org
EMAIL_REPLY_TO=info@bboyarena.org
RESEND_API_KEY=
BREVO_API_KEY=
```

Le migration PocketBase sono in:

```text
docker/pocketbase/pb_migrations
```

Il compose monta la cartella in:

```text
/pb_migrations
```

Il servizio PocketBase viene avviato con:

```text
--migrationsDir=/pb_migrations
```

PocketBase esegue le migration JS non applicate all'avvio del server.

Per forzare manualmente l'applicazione delle migration sul container gia creato:

```bash
sudo docker compose run --rm pocketbase migrate up --dir=/pb_data --migrationsDir=/pb_migrations
```

Poi riavvia:

```bash
sudo docker compose up --build
```

## Produzione

Architettura consigliata:

```text
https://bboyarena.org
  -> GitHub Pages

https://api.bboyarena.org
  -> VPS
  -> Traefik
  -> apps/server
  -> PocketBase interno
```

PocketBase idealmente non va esposto pubblicamente.

In produzione:

```yaml
pocketbase:
  expose:
    - "8090"
  # niente ports
```

L'unico endpoint pubblico backend dovrebbe essere:

```text
https://api.bboyarena.org
```

Runbook VPS:

```text
docs/deploy-vps.md
```

## Prossimi Step

- Migliorare errori PocketBase distinguendo email gia usata, username gia usato e password invalida.
- Passare da token Bearer restituito al client a cookie HttpOnly, Secure e SameSite=Lax.
- Aggiungere OAuth Google/Facebook tramite route server:
  - `GET /api/auth/oauth/:provider/start`
  - `GET /api/auth/oauth/:provider/callback`
- Collegare `packages/sdk` a game e website.
- Implementare profile reale e leaderboard minima.
