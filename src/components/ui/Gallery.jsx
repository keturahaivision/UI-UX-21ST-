'use client';
import { useEffect, useState, useCallback } from 'react';
import { asset } from '@/lib/asset';

export default function Gallery({ images = [] }) {
  const [idx, setIdx] = useState(-1);
  const open = idx >= 0;
  const close = useCallback(() => setIdx(-1), []);
  const move = useCallback((d) => setIdx((i) => (i + d + images.length) % images.length), [images.length]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e) => {
      if (e.key === 'Escape') close();
      if (e.key === 'ArrowRight') move(1);
      if (e.key === 'ArrowLeft') move(-1);
    };
    document.addEventListener('keydown', onKey);
    document.documentElement.style.overflow = 'hidden';
    return () => { document.removeEventListener('keydown', onKey); document.documentElement.style.overflow = ''; };
  }, [open, close, move]);

  if (!images.length) return null;
  return (
    <>
      <div className="grid grid-cols-2 gap-3 md:grid-cols-3">
        {images.map((img, i) => (
          <button key={i} onClick={() => setIdx(i)} className="group relative aspect-[4/3] overflow-hidden rounded-xs bg-ink-800" aria-label={`Open image ${i + 1}`}>
            <img src={asset(img.src)} alt={img.alt} loading="lazy" className="h-full w-full object-cover transition-transform duration-700 ease-settle group-hover:scale-105" />
          </button>
        ))}
      </div>
      {open && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center bg-ink-900/95 p-4" role="dialog" aria-modal="true" onClick={close}>
          <button className="absolute right-5 top-5 u-label text-paper-50" onClick={close} aria-label="Close">CLOSE ✕</button>
          <button className="absolute left-4 u-label text-paper-50 md:left-8" onClick={(e) => { e.stopPropagation(); move(-1); }} aria-label="Previous">←</button>
          <img src={asset(images[idx].src)} alt={images[idx].alt} className="max-h-[85vh] max-w-[90vw] object-contain" onClick={(e) => e.stopPropagation()} />
          <button className="absolute right-4 u-label text-paper-50 md:right-8" onClick={(e) => { e.stopPropagation(); move(1); }} aria-label="Next">→</button>
          <span className="absolute bottom-5 font-mono text-label-sm text-paper-50/70">{idx + 1} / {images.length}</span>
        </div>
      )}
    </>
  );
}
