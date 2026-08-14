export default function PageHeader({ label, title, intro }) {
  return (
    <header className="u-container pb-14 pt-36 md:pt-44">
      {label && <p className="r-eyebrow">{label}</p>}
      <h1 className="mt-5 max-w-4xl r-h text-[2.8rem] leading-[1.03] md:text-[4.2rem]">{title}</h1>
      {intro && <p className="mt-6 max-w-2xl text-lg leading-relaxed text-dmf-ink/60">{intro}</p>}
    </header>
  );
}
