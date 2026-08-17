import { Suspense } from 'react';
import PageHeader from '@/components/ui/PageHeader';
import ProjectGrid from '@/components/ui/ProjectGrid';
import ProjectMap from '@/components/home/ProjectMap';
import { pageMeta } from '@/lib/seo';
import data from '@/data/content.json';

export const metadata = pageMeta({
  title: 'Projects', path: '/projects',
  description: `Explore ${data.stats.total_projects} DMF Engineering projects across master planning, roads & infrastructure, architecture and structural design in the UAE, Saudi Arabia, Qatar and beyond.`,
});

export default function ProjectsPage() {
  return (
    <>
      <PageHeader label="Portfolio" title="Selected projects"
        intro={`${data.stats.total_projects} projects across ${data.stats.countries_served} countries — filter by discipline or location.`} />
      <section className="u-container pb-8"><ProjectMap height={460} /></section>
      <section className="u-container pb-32">
        <Suspense fallback={<p className="font-mono text-[11px] uppercase tracking-[0.16em] text-white/45">Loading projects…</p>}>
          <ProjectGrid />
        </Suspense>
      </section>
    </>
  );
}
