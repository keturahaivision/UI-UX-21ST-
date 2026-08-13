import PageHeader from '@/components/ui/PageHeader';
import { pageMeta } from '@/lib/seo';

export const metadata = pageMeta({
  title: 'Insights', path: '/insights',
  description: 'New writing from DMF on infrastructure, master planning, mobility and building in the Gulf.',
});

export default function InsightsPage() {
  return (
    <>
      <PageHeader label="Thinking" title="Insights"
        intro="New, dated writing on infrastructure, master planning, mobility and sustainability in the Gulf. We publish original pieces — never backdated history." />
      <section className="u-container pb-32">
        <div className="glass rounded-sm p-10 text-center">
          <p className="font-mono text-label-sm text-accent">LAUNCHING SOON</p>
          <p className="mt-4 max-w-xl mx-auto font-body text-body text-stone-300">The first articles are in preparation. Each will carry a clear author and date. Check back, or <a href="/contact" className="u-link-underline text-paper-50">get in touch</a> to be notified.</p>
        </div>
      </section>
    </>
  );
}
