/// <reference types="astro/client" />

interface ImportMetaEnv {
  readonly PUBLIC_SUPABASE_URL?: string;
  readonly PUBLIC_SUPABASE_ANON_KEY?: string;
  readonly PUBLIC_SITE_URL?: string;
  readonly PUBLIC_APP_VERSION?: string;
  readonly PUBLIC_DISCORD_URL?: string;
  readonly PUBLIC_INSTAGRAM_URL?: string;
  readonly PUBLIC_YOUTUBE_URL?: string;
  readonly PUBLIC_CONTACT_EMAIL?: string;
  readonly PUBLIC_NEWSLETTER_URL?: string;
  readonly PUBLIC_POCKETBASE_URL?: string;
  readonly PUBLIC_POCKETBASE_DEVLOGS_COLLECTION?: string;
  readonly PUBLIC_POCKETBASE_DEVLOGS_FILTER?: string;
  readonly PUBLIC_ANALYTICS_SCRIPT_URL?: string;
  readonly PUBLIC_ANALYTICS_WEBSITE_ID?: string;
  readonly PUBLIC_SEO_SITE_NAME?: string;
  readonly PUBLIC_SEO_TITLE?: string;
  readonly PUBLIC_SEO_DESCRIPTION?: string;
  readonly PUBLIC_SEO_OG_IMAGE?: string;
  readonly PUBLIC_SEO_OG_IMAGE_ALT?: string;
  readonly PUBLIC_SEO_LOGO?: string;
  readonly PUBLIC_SEO_LOCALE?: string;
  readonly PUBLIC_SEO_TWITTER_SITE?: string;
  readonly PUBLIC_SEO_TWITTER_CREATOR?: string;
  readonly PUBLIC_SEO_AUTHOR?: string;
  readonly PUBLIC_NEWS_EXTERNAL_FEED_URL?: string;
  readonly PUBLIC_NEWS_EXTERNAL_SOURCE_NAME?: string;
  readonly PUBLIC_NEWS_EXTERNAL_SOURCE_URL?: string;
  readonly ASTRO_BASE_PATH?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
