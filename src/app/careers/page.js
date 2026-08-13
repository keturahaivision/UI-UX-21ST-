import PageHeader from '@/components/ui/PageHeader';
import { pageMeta, SITE } from '@/lib/seo';

export const metadata = pageMeta({
  title: 'Careers', path: '/careers',
  description: 'Build what comes next with DMF Engineering — infrastructure, master planning and engineering roles in Dubai.',
});

export default function CareersPage() {
  return (
    <>
      <PageHeader label="Careers" title="Build what comes next"
        intro="DMF brings planners, engineers and architects into one room. When roles open, they are listed here — real positions only." />
      <section className="u-container pb-32">
        <div className="glass rounded-sm p-10">
          <p className="font-mono text-label-sm text-accent">NO OPEN ROLES LISTED RIGHT NOW</p>
          <p className="mt-4 max-w-xl font-body text-body text-stone-300">We’re always glad to hear from strong master planners, roads &amp; infrastructure, traffic, structural and civil engineers. Send your portfolio to <a href={`mailto:${SITE.email}`} className="u-link-underline text-paper-50">{SITE.email}</a>.</p>
        </div>
      </section>
    </>
  );
}
