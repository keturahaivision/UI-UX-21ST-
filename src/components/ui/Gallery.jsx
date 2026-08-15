'use client';
import { useEffect, useState, useCallback, useRef } from 'react';
import { asset } from '@/lib/asset';

export default function Gallery({ images = [] }) {
  const [idx, setIdx] = useState(-1);
  const open = idx >= 0;
  const close = useCallback(() => setIdx(-1), []);
  const move = useCallback((d) => setIdx((i) => (i + d + images.length) % images.length), [images.length]);
  const dialogRef = useRef(null);
  const triggerRef = useRef(null); // element to restore focus to on close

  useEffect(() => {
    if (!open) return;
    const dialog = dialogRef.current;
    const focusables = () => dialog ? [...dialog.querySelectorAll('button')] : [];
    // move focus into the dialog
    const first = focusables()[0];
    first && first.focus();

    const onKey = (e) => {
      if (e.key === 'Escape') { close(); return; }
      if (e.key === 'ArrowRight') { move(1); return; }
      if (e.key === 'ArrowLeft') { move(-1); return; }
      if (e.key === 'Tab') {
        // trap focus within the dialog
        const f = focusables();
        if (!f.length) return;
        const firstEl = f[0], lastEl = f[f.length - 1];
        if (e.shiftKey && document.activeElement === firstEl) { e.preventDefault(); lastEl.focus(); }
        else if (!e.shiftKey && document.activeElement === lastEl) { e.preventDefault(); firstEl.focus(); }
      }
    };
    document.addEventListener('keydown', onKey);
    document.documentElement.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKey);
      document.documentElement.style.overflow = '';
      // restore focus to the thumbnail that opened the dialog
      triggerRef.current && triggerRef.current.focus();
    };
  }, [open, close, move]);

  if (!images.length) return null;
  return (
    <>
      <div className="grid grid-cols-2 gap-3 md:grid-cols-3">
        {images.map((img, i) => (
          <button key={i} onClick={(e) => { triggerRef.current = e.currentTarget; setIdx(i); }}
            className="group relative aspect-[4/3] overflow-hidden rounded-[0.9rem] border border-white/10 bg-white/[0.03]" aria-label={`Open image ${i + 1} of ${images.length}`}>
            <img src={asset(img.src)} alt={img.alt} loading="lazy" className="h-full w-full object-cover transition-transform duration-700 ease-settle group-hover:scale-105" />
          </button>
        ))}
      </div>
      {open && (
        <div ref={dialogRef} className="fixed inset-0 z-[110] flex items-center justify-center bg-brand-coal/95 p-4"
          role="dialog" aria-modal="true" aria-label={`Image ${idx + 1} of ${images.length}`} onClick={close}>
          <button className="absolute right-5 top-5 u-label text-white" onClick={close} aria-label="Close gallery">CLOSE ✕</button>
          <button className="absolute left-4 u-label text-white md:left-8" onClick={(e) => { e.stopPropagation(); move(-1); }} aria-label="Previous image">←</button>
          <img src={asset(images[idx].src)} alt={images[idx].alt} className="max-h-[85vh] max-w-[90vw] object-contain" onClick={(e) => e.stopPropagation()} />
          <button className="absolute right-4 u-label text-white md:right-8" onClick={(e) => { e.stopPropagation(); move(1); }} aria-label="Next image">→</button>
          <span className="absolute bottom-5 font-mono text-label-sm text-white/60">{idx + 1} / {images.length}</span>
        </div>
      )}
    </>
  );
}
