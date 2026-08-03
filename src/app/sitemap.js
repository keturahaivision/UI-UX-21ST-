import data from '@/data/content.json';
export default function sitemap() {
  const base = 'https://dmfeng.com';
  const now = new Date().toISOString();
  const routes = ['', '/projects', '/services', '/about', '/contact'].map((r) => ({ url: base + r, lastModified: now }));
  const projects = data.projects.map((p) => ({ url: `${base}/projects/${p.slug}`, lastModified: now }));
  return [...routes, ...projects];
}
