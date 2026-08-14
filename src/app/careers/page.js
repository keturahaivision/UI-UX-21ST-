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
        <div className="rounded-[1.25rem] border border-black/[0.08] bg-white p-12">
          <p className="font-mono text-[11px] font-semibold uppercase tracking-[0.18em] text-dmf-red">No open roles listed right now</p>
          <p className="mt-4 max-w-xl text-[15px] leading-relaxed text-dmf-ink/65">We’re always glad to hear from strong master planners, roads &amp; infrastructure, traffic, structural and civil engineers. {SITE.email ? (<>Send your portfolio to <a href={`mailto:${SITE.email}`} className="font-semibold text-dmf-ink underline underline-offset-4">{SITE.email}</a>.</>) : (<>Reach us via the <a href="/contact" className="font-semibold text-dmf-ink underline underline-offset-4">contact form</a>.</>)}</p>
        </div>
      </section>
    </>
  );
}
