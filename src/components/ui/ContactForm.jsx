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

  const field = 'w-full rounded-xs border border-slate-600 bg-ink-800 px-4 py-3 font-body text-body text-paper-50 placeholder:text-stone-500 focus:border-accent';
  return (
    <form onSubmit={onSubmit} className="space-y-5">
      <div className="grid gap-5 sm:grid-cols-2">
        <label className="block"><span className="u-label text-stone-400">Name</span>
          <input name="name" required autoComplete="name" className={`mt-2 ${field}`} placeholder="Your name" /></label>
        <label className="block"><span className="u-label text-stone-400">Email</span>
          <input name="email" type="email" required autoComplete="email" className={`mt-2 ${field}`} placeholder="you@company.com" /></label>
      </div>
      <label className="block"><span className="u-label text-stone-400">Subject</span>
        <input name="subject" className={`mt-2 ${field}`} placeholder="How can we help?" /></label>
      <label className="block"><span className="u-label text-stone-400">Message</span>
        <textarea name="message" required rows={5} className={`mt-2 ${field}`} placeholder="Tell us about your project" /></label>
      <button type="submit" disabled={status === 'sending'}
        className="rounded-sm bg-accent px-8 py-4 font-mono text-label uppercase text-paper-50 transition-colors duration-500 ease-settle hover:bg-accent-ink disabled:opacity-60">
        {status === 'sending' ? 'Sending…' : 'Send message'}
      </button>
      <div role="status" aria-live="polite" className="min-h-[1.25rem]">
        {status === 'sent' && <p className="font-body text-caption text-accent-soft">Thank you — we'll be in touch shortly.</p>}
        {status === 'error' && <p className="font-body text-caption text-accent-soft">Something went wrong. Please try again, or call us on the number on the contact page.</p>}
        {status === 'unconfigured' && <p className="font-body text-caption text-stone-400">Form endpoint not configured yet — set NEXT_PUBLIC_FORM_ENDPOINT in .env.</p>}
      </div>
    </form>
  );
}
