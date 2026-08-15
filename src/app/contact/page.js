import PageHeader from '@/components/ui/PageHeader';
import ContactForm from '@/components/ui/ContactForm';
import { pageMeta, SITE } from '@/lib/seo';

export const metadata = pageMeta({
  title: 'Contact', path: '/contact',
  description: 'Get in touch with DMF Engineering — Baniyas Road, Green Tower, Deira, Dubai, UAE. Call +971 4 227 2525 or send us a message.',
});

function Detail({ label, children }) {
  return (
    <div>
      <p className="text-[12px] font-semibold uppercase tracking-[0.16em] text-white/45">{label}</p>
      <div className="mt-3 text-[15px] text-white/80">{children}</div>
    </div>
  );
}

export default function ContactPage() {
  return (
    <>
      <PageHeader label="Get in touch" title="Let's build something lasting" />
      <section className="u-container grid gap-16 pb-32 lg:grid-cols-[1fr_1.2fr]">
        <div className="space-y-8">
          <Detail label="Office in Dubai"><p className="max-w-xs leading-relaxed">{SITE.address}</p></Detail>
          <Detail label="Phone"><a href={`tel:${SITE.phone.replace(/\s/g, '')}`} className="u-link-underline">{SITE.phone}</a></Detail>
          {SITE.email && <Detail label="Email"><a href={`mailto:${SITE.email}`} className="u-link-underline">{SITE.email}</a></Detail>}
          <Detail label="Follow"><a href={SITE.linkedin} target="_blank" rel="noopener noreferrer" className="u-link-underline">LinkedIn</a></Detail>
        </div>
        <div><ContactForm /></div>
      </section>
    </>
  );
}
