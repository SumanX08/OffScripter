import logo from "../../assets/logo2.png";

interface LogoProps {
  inverted?: boolean;
  showText?: boolean;
}

export default function Logo({
  inverted = false,
  showText = true,
}: LogoProps) {
  return (
    <a
      href="#top"
      aria-label="OffScripter home"
      className={`group inline-flex items-center gap-2 ${
        inverted ? "text-cream" : "text-forest"
      }`}
    >
      <img
        src={logo}
        alt=""
        className="h-7 w-7 shrink-0 object-contain transition-transform duration-200 group-hover:scale-105"
      />

      {showText && (
        <span className="text-xl font-extrabold tracking-tight">
          OffScripter
        </span>
      )}
    </a>
  );
}