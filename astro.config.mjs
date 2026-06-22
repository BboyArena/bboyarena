import { defineConfig } from 'astro/config';
import react from '@astrojs/react';
import tailwindcss from '@tailwindcss/vite';
import AstroPWA from '@vite-pwa/astro';

const repoName = process.env.GITHUB_REPOSITORY?.split('/')[1];
const publicSiteUrl = process.env.PUBLIC_SITE_URL;
const isCustomDomain = Boolean(publicSiteUrl) && !publicSiteUrl.includes('github.io');
const isGithubPagesProjectRepo = process.env.GITHUB_ACTIONS === 'true' && repoName && !repoName.endsWith('.github.io');
const base = process.env.ASTRO_BASE_PATH ?? (isCustomDomain ? '/' : isGithubPagesProjectRepo ? `/${repoName}/` : '/');
const withBase = (pathname) => (base === '/' ? pathname : `${base.replace(/\/$/, '')}${pathname.startsWith('/') ? pathname : `/${pathname}`}`);
const seoSiteName = process.env.PUBLIC_SEO_SITE_NAME ?? process.env.PUBLIC_SEO_TITLE ?? 'BboyArena.org';
const seoTitle = process.env.PUBLIC_SEO_TITLE ?? seoSiteName;
const seoDescription =
  process.env.PUBLIC_SEO_DESCRIPTION ??
  'BboyArena.org is an independent, community-driven project about breaking culture, creative movement, and experimental game development, built with open development and privacy-friendly design.';
const chromeColor = '#eae0d0';

// https://astro.build/config
export default defineConfig({
  site: publicSiteUrl,
  base,
  i18n: {
    defaultLocale: 'en-US',
    locales: [
      'en-US',
      { path: 'it', codes: ['it-IT'] },
      { path: 'es', codes: ['es-419'] },
      { path: 'pt-br', codes: ['pt-BR'] },
      { path: 'zh', codes: ['zh-Hans'] }
    ],
    routing: {
      prefixDefaultLocale: false
    }
  },
  integrations: [
    react(),
    AstroPWA({
      registerType: 'autoUpdate',
      base,
      includeHtmlHeadLinks: false,
      injectRegister: 'script-defer',
      devOptions: {
        enabled: false,
        type: 'module'
      },
      manifest: {
        name: seoSiteName,
        short_name: seoTitle,
        description: seoDescription,
        theme_color: chromeColor,
        background_color: chromeColor,
        display: 'standalone',
        start_url: base,
        scope: base,
        icons: [
          {
            src: withBase('/icon.png'),
            sizes: 'any',
            type: 'image/png',
            purpose: 'any'
          },
          {
            src: withBase('/android-chrome-192x192.png'),
            sizes: '192x192',
            type: 'image/png',
            purpose: 'any maskable'
          },
          {
            src: withBase('/android-chrome-512x512.png'),
            sizes: '512x512',
            type: 'image/png',
            purpose: 'any maskable'
          },
        ]
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,svg,png,webp,json}'],
        maximumFileSizeToCacheInBytes: 4 * 1024 * 1024
      }
    })
  ],
  // Deploy statically
  output: 'static',
  vite: {
    plugins: [tailwindcss()]
  }
});
