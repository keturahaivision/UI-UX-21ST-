// Image source resolver. Local dev: empty base -> '/images/...'.
// Vercel preview: NEXT_PUBLIC_ASSET_BASE points at the public GitHub raw host,
// so the deploy needs no bundled binaries (all WebP are committed to the repo).
export const ASSET_BASE = process.env.NEXT_PUBLIC_ASSET_BASE || '';
export const asset = (p) => (p && p.startsWith('/')) ? ASSET_BASE + p : p;
