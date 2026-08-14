import PageHeader from '@/components/ui/PageHeader';
import { pageMeta } from '@/lib/seo';

export const metadata = pageMeta({
  title: 'Partnerships', path: '/partnerships',
  description: 'How DMF collaborates — with developers, architects, planners, contractors, specialist consultants and authorities. Relationships are shown only when verified.',
});

const TIERS = [
  ['Verified relationships', 'Named collaborators, shown with their permission and evidence.'],
  ['Project collaborations', 'Firms DMF has worked alongside on a specific delivery.'],
  ['Strategic partnerships', 'Formal, ongoing arrangements.'],
  ['Professional networks', 'Bodies and communities DMF participates in.'],
];
const CATEGORIES = ['Developers', 'Architects', 'Planners', 'Contractors', 'Specialist consultants', 'Authority interfaces', 'Academic & technology'];

export default function PartnershipsPage() {
  return (
    <>
      <PageHeader label="Collaboration" title="Engineering is a team sport"
        intro="Development works when planners, engineers, architects, developers, contractors and authorities move together. DMF sits at the centre of that coordination." />
      <section className="u-container pb-24">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {TIERS.map(([t, d]) => (
            <div key={t} className="rounded-[1rem] border border-black/[0.08] bg-white p-6">
              <h2 className="font-fraunces text-xl font-medium text-dmf-ink">{t}</h2>
              <p className="mt-3 text-sm leading-relaxed text-dmf-ink/60">{d}</p>
            </div>
          ))}
        </div>
        <div className="mt-12 flex flex-wrap gap-2">
          {CATEGORIES.map((c) => (
            <span key={c} className="rounded-full border border-black/10 bg-white px-3.5 py-1.5 text-xs font-medium text-dmf-ink/70">{c}</span>
          ))}
        </div>
        <div className="mt-16 max-w-2xl rounded-[1.25rem] border border-black/[0.08] bg-dmf-panel p-8">
          <p className="r-eyebrow">A note on truth</p>
          <p className="mt-4 text-[15px] leading-relaxed text-dmf-ink/70">
            We publish a collaborator’s name or logo only when the relationship is verified and we have permission to show it. Verified relationships, project collaborations, strategic partnerships and professional networks are kept distinct — never blurred. This page fills in as those confirmations arrive.
          </p>
        </div>
      </section>
    </>
  );
}
