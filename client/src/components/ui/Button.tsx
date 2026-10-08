import type {
  AnchorHTMLAttributes,
  ButtonHTMLAttributes,
  ReactNode,
} from "react";

type BaseProps = {
  children: ReactNode;
  variant?: "primary" | "secondary" | "accent" | "light";
  className?: string;
};

type ButtonProps = BaseProps &
  ButtonHTMLAttributes<HTMLButtonElement> & {
    href?: undefined;
  };

type LinkButtonProps = BaseProps &
  AnchorHTMLAttributes<HTMLAnchorElement> & {
    href: string;
  };

type Props = ButtonProps | LinkButtonProps;

export default function Button({
  children,
  variant = "primary",
  className = "",
  ...props
}: Props) {
  const baseStyles =
    "inline-flex min-h-10 items-center justify-center gap-2 border px-5 py-2 text-[0.82rem] font-extrabold no-underline transition duration-200 hover:-translate-y-0.5";

  const variants = {
    primary:
      "border-transparent bg-forest text-cream shadow-[4px_4px_0_var(--color-amber)] hover:shadow-[6px_6px_0_var(--color-amber)]",

    secondary:
      "border-forest/25 bg-transparent text-forest hover:bg-mist",

    accent:
      "border-transparent bg-rust text-cream hover:bg-[color-mix(in_srgb,var(--color-rust)_86%,var(--color-forest))]",

    light:
      "border-transparent bg-cream text-forest hover:bg-amber",
  };

  const classes = `${baseStyles} ${variants[variant]} ${className}`;

  if ("href" in props) {
    return (
      <a
        {...props}
        href={props.href}
        className={classes}
      >
        {children}
      </a>
    );
  }

  return (
    <button
      {...props}
      type={props.type ?? "button"}
      className={classes}
    >
      {children}
    </button>
  );
}