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
      <section className="u-container pb-20">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {TIERS.map(([t, d]) => (
            <div key={t} className="glass rounded-sm p-6">
              <h2 className="font-display text-title text-paper-50">{t}</h2>
              <p className="mt-3 font-body text-caption text-stone-300">{d}</p>
            </div>
          ))}
        </div>
        <div className="mt-12 flex flex-wrap gap-2">
          {CATEGORIES.map((c) => (
            <span key={c} className="rounded-sm border border-slate-600 px-3 py-1.5 font-mono text-label-sm text-stone-300">{c}</span>
          ))}
        </div>
        <div className="mt-16 max-w-2xl rounded-sm border border-slate-700 p-8">
          <p className="u-label text-accent">A note on truth</p>
          <p className="mt-4 font-body text-body text-stone-300">
            We publish a collaborator’s name or logo only when the relationship is verified and we have permission to show it. Verified relationships, project collaborations, strategic partnerships and professional networks are kept distinct — never blurred. This page fills in as those confirmations arrive.
          </p>
        </div>
      </section>
    </>
  );
}
