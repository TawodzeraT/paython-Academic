import { MetadataRoute } from 'next';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'https://paythonacademy.com';

  // Static pages
  const staticPages: MetadataRoute.Sitemap = [
    { url: baseUrl,               lastModified: new Date(), changeFrequency: 'weekly',  priority: 1 },
    { url: `${baseUrl}/courses`,  lastModified: new Date(), changeFrequency: 'daily',   priority: 0.9 },
    { url: `${baseUrl}/blog`,     lastModified: new Date(), changeFrequency: 'daily',   priority: 0.8 },
    { url: `${baseUrl}/login`,    lastModified: new Date(), changeFrequency: 'monthly', priority: 0.5 },
    { url: `${baseUrl}/register`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.6 },
  ];

  // Fetch dynamic course pages
  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/courses`);
    if (res.ok) {
      const { courses } = await res.json();
      const coursePages: MetadataRoute.Sitemap = courses.map((c: { id: string }) => ({
        url: `${baseUrl}/courses/${c.id}`,
        lastModified: new Date(),
        changeFrequency: 'weekly' as const,
        priority: 0.8,
      }));
      return [...staticPages, ...coursePages];
    }
  } catch {
    // Fall back to static only
  }

  return staticPages;
}
