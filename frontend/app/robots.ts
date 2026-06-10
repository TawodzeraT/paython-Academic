import { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'https://paythonacademy.com';
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: ['/dashboard/', '/admin/', '/checkout/', '/learn/'],
      },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}
