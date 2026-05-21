import { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: ['/dashboard', '/settings', '/messages', '/blogs/new', '/profile', '/verify-email', '/reset-password', '/forgot-password'],
      },
    ],
    sitemap: 'https://www.belife.site/sitemap.xml',
    host: 'https://www.belife.site',
  };
}
