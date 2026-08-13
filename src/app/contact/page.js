import PageHeader from '@/components/ui/PageHeader';
import ContactForm from '@/components/ui/ContactForm';
import { pageMeta, SITE } from '@/lib/seo';

export const metadata = pageMeta({
  title: 'Contact', path: '/contact',
  description: 'Get in touch with DMF Engineering — Baniyas Road, Green Tower, Deira, Dubai, UAE. Call +971 4 227 2525 or send us a message.',
});

export default function ContactPage() {
  return (
    <>
      <PageHeader label="Get in touch" title="Let's build something lasting" />
      <section className="u-container grid gap-16 pb-32 lg:grid-cols-[1fr_1.2fr]">
        <div className="space-y-8">
          <div>
            <p className="u-label text-stone-500">Office in Dubai</p>
            <p className="mt-3 max-w-xs font-body text-body text-stone-200">{SITE.address}</p>
          </div>
          <div>
            <p className="u-label text-stone-500">Phone</p>
            <a href={`tel:${SITE.phone.replace(/\s/g, '')}`} className="mt-3 block u-link-underline font-body text-body text-stone-200">{SITE.phone}</a>
          </div>
          {SITE.email && (
            <div>
              <p className="u-label text-stone-500">Email</p>
              <a href={`mailto:${SITE.email}`} className="mt-3 block u-link-underline font-body text-body text-stone-200">{SITE.email}</a>
            </div>
          )}
          <div>
            <p className="u-label text-stone-500">Follow</p>
            <a href={SITE.linkedin} target="_blank" rel="noopener noreferrer" className="mt-3 block u-link-underline font-body text-body text-stone-200">LinkedIn</a>
          </div>
        </div>
        <div><ContactForm /></div>
      </section>
    </>
  );
}
