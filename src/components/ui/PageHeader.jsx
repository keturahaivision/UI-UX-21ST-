export default function PageHeader({ label, title, intro }) {
  return (
    <header className="u-container pb-12 pt-36 md:pt-44">
      {label && <p className="u-label text-accent-soft">{label}</p>}
      <h1 className="mt-5 max-w-4xl font-display text-display-3 text-paper-50">{title}</h1>
      {intro && <p className="mt-6 max-w-2xl font-body text-body-lg text-stone-300">{intro}</p>}
    </header>
  );
}
