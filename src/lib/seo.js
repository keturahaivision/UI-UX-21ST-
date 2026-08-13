export const SITE = {
  name: 'DMF Engineering',
  url: 'https://dmfeng.com',
  tagline: 'Architectural & engineering excellence across the UAE, Gulf and beyond.',
  description:
    'DMF Engineering delivers innovative, sustainable master planning, roads & infrastructure, architecture and structural design across the UAE, Saudi Arabia, Qatar and beyond.',
  // No email is published until the owner confirms one (provenance). Set NEXT_PUBLIC_CONTACT_EMAIL to enable it.
  email: process.env.NEXT_PUBLIC_CONTACT_EMAIL || null,
  phone: '+971 4 227 2525',
  address: 'Baniyas Road, Green Tower, 5th floor, Office 504, Deira Area, PO BOX 123211, Dubai, United Arab Emirates',
  linkedin: 'https://www.linkedin.com/company/dmfdubai/',
};

export function pageMeta({ title, description, path = '/' }) {
  const full = title ? `${title} — ${SITE.name}` : `${SITE.name} — ${SITE.tagline}`;
  const desc = description || SITE.description;
  return {
    title: full,
    description: desc,
    alternates: { canonical: path },
    openGraph: { title: full, description: desc, url: SITE.url + path, siteName: SITE.name, type: 'website' },
    twitter: { card: 'summary_large_image', title: full, description: desc },
  };
}

export function orgJsonLd() {
  return {
    '@context': 'https://schema.org', '@type': 'Organization',
    name: SITE.name, url: SITE.url, description: SITE.description,
    address: { '@type': 'PostalAddress', streetAddress: SITE.address, addressLocality: 'Dubai', addressCountry: 'AE' },
    telephone: SITE.phone, ...(SITE.email ? { email: SITE.email } : {}), sameAs: [SITE.linkedin],
  };
}
export function projectJsonLd(p) {
  return {
    '@context': 'https://schema.org', '@type': 'CreativeWork',
    name: p.name, about: p.disciplineDisplay,
    ...(p.description ? { description: p.description } : {}),
    ...(p.location ? { locationCreated: p.location } : {}),
    ...(p.client ? { sourceOrganization: { '@type': 'Organization', name: p.client } } : {}),
    creator: { '@type': 'Organization', name: SITE.name },
  };
}
