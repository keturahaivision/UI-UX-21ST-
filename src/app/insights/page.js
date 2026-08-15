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
        <div className="rounded-[1.25rem] tile p-12 text-center">
          <p className="font-mono text-[11px] font-semibold uppercase tracking-[0.18em] text-sys-red">Launching soon</p>
          <p className="mx-auto mt-4 max-w-xl text-[15px] leading-relaxed text-sys-muted">The first articles are in preparation. Each will carry a clear author and date. Check back, or <a href="/contact" className="font-semibold text-sys-ink underline underline-offset-4">get in touch</a> to be notified.</p>
        </div>
      </section>
    </>
  );
}
