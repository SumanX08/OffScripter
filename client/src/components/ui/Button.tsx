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
    href?: never;
};

type LinkButtonProps = BaseProps &
  AnchorHTMLAttributes<HTMLAnchorElement> & {
    href: string;
};

type Props = ButtonProps | LinkButtonProps;

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

export default function Button(props: Props) {
  if (typeof props.href === "string") {
    const {
      children,
      variant = "primary",
      className = "",
      href,
      ...anchorProps
    } = props as LinkButtonProps;

    const classes = `${baseStyles} ${variants[variant]} ${className}`;

    return (
      <a
        {...(anchorProps as AnchorHTMLAttributes<HTMLAnchorElement>)}
        href={href}
        className={classes}
      >
        {children}
      </a>
    );
  }

  const {
    children,
    variant = "primary",
    className = "",
    type = "button",
    ...buttonProps
  } = props as ButtonProps;

  const classes = `${baseStyles} ${variants[variant]} ${className}`;

  return (
    <button
      {...buttonProps}
      type={type}
      className={classes}
    >
      {children}
    </button>
  );
}