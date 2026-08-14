'use client';
import { useState } from 'react';

// Posts to a configurable endpoint (Formspree-style) via NEXT_PUBLIC_FORM_ENDPOINT.
export default function ContactForm() {
  const [status, setStatus] = useState('idle');
  const endpoint = process.env.NEXT_PUBLIC_FORM_ENDPOINT || '';

  async function onSubmit(e) {
    e.preventDefault();
    setStatus('sending');
    const form = e.currentTarget;
    const body = new FormData(form);
    if (!endpoint) { setStatus('unconfigured'); return; }
    try {
      const res = await fetch(endpoint, { method: 'POST', body, headers: { Accept: 'application/json' } });
      setStatus(res.ok ? 'sent' : 'error');
      if (res.ok) form.reset();
    } catch { setStatus('error'); }
  }

  const label = 'text-[12px] font-semibold uppercase tracking-[0.16em] text-dmf-ink/50';
  const field = 'w-full rounded-[0.7rem] border border-black/12 bg-white px-4 py-3 text-[15px] text-dmf-ink placeholder:text-dmf-ink/35 focus:border-dmf-red focus:outline-none';
  return (
    <form onSubmit={onSubmit} className="space-y-5">
      <div className="grid gap-5 sm:grid-cols-2">
        <label className="block"><span className={label}>Name</span>
          <input name="name" required autoComplete="name" className={`mt-2 ${field}`} placeholder="Your name" /></label>
        <label className="block"><span className={label}>Email</span>
          <input name="email" type="email" required autoComplete="email" className={`mt-2 ${field}`} placeholder="you@company.com" /></label>
      </div>
      <label className="block"><span className={label}>Subject</span>
        <input name="subject" className={`mt-2 ${field}`} placeholder="How can we help?" /></label>
      <label className="block"><span className={label}>Message</span>
        <textarea name="message" required rows={5} className={`mt-2 ${field}`} placeholder="Tell us about your project" /></label>
      <button type="submit" disabled={status === 'sending'}
        className="rounded-full bg-dmf-red px-8 py-3.5 text-sm font-semibold text-white transition-colors hover:bg-dmf-red-ink disabled:opacity-60">
        {status === 'sending' ? 'Sending…' : 'Send message'}
      </button>
      <div role="status" aria-live="polite" className="min-h-[1.25rem]">
        {status === 'sent' && <p className="text-sm text-dmf-red">Thank you — we'll be in touch shortly.</p>}
        {status === 'error' && <p className="text-sm text-dmf-red">Something went wrong. Please try again, or call us on the number on the contact page.</p>}
        {status === 'unconfigured' && <p className="text-sm text-dmf-ink/50">Form endpoint not configured yet — set NEXT_PUBLIC_FORM_ENDPOINT in .env.</p>}
      </div>
    </form>
  );
}
