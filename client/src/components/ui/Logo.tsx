export default function Logo({ inverted = false }) {
  return (
    <a
      href="#top"
      aria-label="OffScripter home"
      className={`group inline-flex items-center gap-3 font-semibold tracking-tight ${
        inverted ? "text-cream" : "text-forest"
      }`}
    >
      <span
        className={`grid size-9 place-items-center border-2 ${
          inverted ? "border-cream" : "border-forest"
        } transition-transform group-hover:-rotate-6`}
      >
        <span className="font-serif text-xl italic leading-none">O</span>
      </span>

      <span className="text-lg">OffScripter</span>
    </a>
  );
}