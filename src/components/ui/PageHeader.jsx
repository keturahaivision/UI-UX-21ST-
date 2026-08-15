// Systems Layer page header — dark, engineered, with a hairline grid backdrop.
export default function PageHeader({ label, title, intro }) {
  return (
    <header className="relative overflow-hidden border-b border-sys-line-soft">
      <div className="pointer-events-none absolute inset-0 grid-bg opacity-60 [mask-image:radial-gradient(120%_90%_at_20%_0%,#000_25%,transparent_75%)]" />
      <div className="u-container relative pb-16 pt-36 md:pt-44">
        {label && <p className="r-eyebrow">{label}</p>}
        <h1 className="mt-5 max-w-4xl r-h text-[2.8rem] leading-[1.02] md:text-[4.2rem]">{title}</h1>
        {intro && <p className="mt-6 max-w-2xl text-lg leading-relaxed text-sys-muted">{intro}</p>}
      </div>
    </header>
  );
}
