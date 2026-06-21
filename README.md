# BboyArena.org

Questo progetto è un casual browser game 3D con atmosfera street/PS2: piazza urbana, cemento, graffiti, crew e HUD arcade, installabile come Progressive Web App (PWA).

## 🚀 Stack Tecnologica

- **Astro**: Generatore statico veloce e performante.
- **React**: Gestione dei componenti client-side e interattivi.
- **TypeScript**: Tipizzazione statica per una base di codice solida.
- **TailwindCSS (v4)**: Styling reattivo configurato nativamente via Vite.
- **Three.js & @react-three/fiber & @react-three/drei**: Motore e visualizzatore di elementi 3D.
- **Zustand**: Gestione globale dello stato della UI, score e volume.
- **XState (v5)**: Macchina a stati per controllare i cicli di gioco (idle, ready, playing, paused, gameOver).
- **@vite-pwa/astro**: Generatore di Manifest e Service Worker per il funzionamento offline e installabilità.
- **Supabase**: Predisposizione del client per salvare record e punteggi.

---

## 💻 Installazione e Comandi

Tutti i comandi vanno eseguiti dalla cartella radice del progetto.

### 1. Installazione delle dipendenze
```bash
npm install
```

### 2. Sviluppo locale
Avvia il server di sviluppo su `http://localhost:4321/`:
```bash
npm run dev
```

### 3. Build statico di produzione
Compila il progetto staticamente (compresi Service Worker e manifest PWA) nella cartella `dist/`:
```bash
npm run build
```

### 4. Anteprima locale del build di produzione
Avvia il server di preview locale per testare la build generata in `dist/`:
```bash
npm run preview
```

---

## 🔗 Integrazione Supabase

Il client Supabase è pre-configurato in `src/lib/supabase.ts`. Per connetterlo al tuo database reale, configura le seguenti variabili d'ambiente in un file `.env` nella root del progetto:

```env
PUBLIC_SUPABASE_URL=https://tuo-progetto.supabase.co
PUBLIC_SUPABASE_ANON_KEY=tua-chiave-anonima-supabase
PUBLIC_SITE_URL=https://bboyarena.org
PUBLIC_DISCORD_URL=https://discord.gg/tuo-invito
PUBLIC_NEWSLETTER_URL=https://tuo-newsletter.example.com
```

*Nota: le variabili con prefisso `PUBLIC_` vengono esposte sia client-side che server-side nel contesto di Astro.*

### File di esempio

Puoi partire da [`.env.example`](./.env.example) e creare un `.env` locale con i valori reali.

### Aggiungere nuove variabili mantenendo lo standard

Nel progetto seguiamo questa regola:

- usa `PUBLIC_` per i valori che devono essere leggibili anche nel client;
- lascia senza prefisso `PUBLIC_` ciò che resta solo lato server o build;
- aggiungi prima la chiave in [`src/env.d.ts`](./src/env.d.ts), poi l'esempio in [`.env.example`](./.env.example).

Esempio SEO:

```env
PUBLIC_SEO_SITE_NAME=BboyArena.org
PUBLIC_SEO_TITLE=BboyArena.org
PUBLIC_SEO_DESCRIPTION=BboyArena.org is an independent, community-driven project about breaking culture, creative movement, and experimental game development, built with open development and privacy-friendly design.
PUBLIC_SEO_OG_IMAGE=/og-image.png
PUBLIC_SEO_OG_IMAGE_ALT=BboyArena.org cover image
PUBLIC_SEO_LOGO=/favicon.svg
PUBLIC_SEO_LOCALE=it_IT
PUBLIC_SEO_TWITTER_SITE=@breakdance3d
PUBLIC_SEO_TWITTER_CREATOR=@breakdance3d
PUBLIC_SEO_AUTHOR=BboyArena.org Editorial
PUBLIC_DISCORD_URL=https://discord.gg/tuo-invito
PUBLIC_NEWSLETTER_URL=https://tuo-newsletter.example.com
```

Nel layout puoi usarle come fallback e, per una news, attivare il profilo `article`:

```astro
<Layout
  title="Titolo news"
  description="Descrizione news"
  type="article"
  publishedTime="2026-06-18T10:00:00+02:00"
  modifiedTime="2026-06-18T12:15:00+02:00"
  section="News"
  tags={["breaking", "update", "gameplay"]}
  image="/news/hero.jpg"
  imageAlt="Anteprima della notizia"
  canonical="/news/titolo-news"
/>
```

Se vuoi un nuovo tipo di pagina SEO, il pattern da seguire è:

- aggiungi la variabile in [`src/env.d.ts`](./src/env.d.ts);
- aggiungi il valore di esempio in [`.env.example`](./.env.example);
- consuma la variabile nel layout o nell'helper condiviso [`src/lib/seo.ts`](./src/lib/seo.ts);
- per le news, usa `type="article"` e compila `publishedTime`, `modifiedTime`, `section` e `tags`.

Se vuoi creare una pagina news, parti da un layout Astro normale e passa al `Layout` i campi editoriali. L'helper costruisce già:

- canonical assoluto;
- Open Graph e Twitter Card;
- JSON-LD `Article` o `NewsArticle`;
- `robots` coerente con `noindex`;
- `article:*` quando `type="article"`.

### Struttura news

Le news sono organizzate in tre categorie:

- `devlog`: dietro le quinte del progetto;
- `app`: aggiornamenti e cambiamenti sulla app;
- `scene`: notizie reali da un feed esterno configurabile.

Le rotte disponibili sono:

- `/news`
- `/news/devlog`
- `/news/app`
- `/news/scene`

Per la categoria `scene` puoi impostare un feed RSS o Atom con:

```env
PUBLIC_NEWS_EXTERNAL_FEED_URL=https://example.com/feed.xml
PUBLIC_NEWS_EXTERNAL_SOURCE_NAME=Nome della fonte
PUBLIC_NEWS_EXTERNAL_SOURCE_URL=https://example.com
```

---

## 📦 Deploy su GitHub Pages

Questo progetto è configurato per il build statico ed è compatibile al 100% con GitHub Pages.

### Configurazione del base path
Se deployi su GitHub Pages in una sotto-directory (es: `https://<username>.github.io/<nome-repo>/`), devi configurare il `base` in `astro.config.mjs`:

```javascript
// astro.config.mjs
export default defineConfig({
  // ...
  base: '/<nome-repo>/',
  // ...
});
```

Se invece usi un dominio personalizzato come `https://bboyarena.org/`, il `base` deve restare `/` e devi impostare `PUBLIC_SITE_URL=https://bboyarena.org` nell'environment `github-pages`.

### Procedura di Deploy
1. Esegui `npm run build` per generare la cartella `dist/`.
2. Esegui il push del contenuto di `dist/` sul branch `gh-pages` della tua repository, oppure configura un workflow di GitHub Actions (consigliato).

---

## 🐳 Infrastruttura Docker

Il file `docker-compose.yml` mette su l'infrastruttura di supporto:

- Traefik come reverse proxy
- Supabase self-hosted
- Colyseus per il multiplayer
- frontend opzionale in container

### Uso consigliato in sviluppo

- avvia l'infrastruttura con `docker compose up -d`
- avvia il frontend in locale con `npm run dev`
- se vuoi containerizzare anche il frontend, usa `docker compose --profile frontend up -d`

### Host locali

- `game.localhost` -> frontend container opzionale
- `supabase.localhost` -> gateway API Supabase
- `studio.localhost` -> Supabase Studio
- `ws.localhost` -> Colyseus
- `traefik.localhost` -> dashboard Traefik
