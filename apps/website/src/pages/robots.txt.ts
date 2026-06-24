const getSiteUrl = () => {
  const publicSiteUrl = import.meta.env.PUBLIC_SITE_URL?.trim() || 'https://bboyarena.org';
  return publicSiteUrl.replace(/\/$/, '');
};

export async function GET() {
  const siteUrl = getSiteUrl();
  const body = `User-agent: *
Allow: /

Sitemap: ${siteUrl}/sitemap-index.xml
`;

  return new Response(body, {
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
      'Cache-Control': 'public, max-age=3600'
    }
  });
}
