
import { useState } from "react";
import { ArrowRight, Menu, X } from "lucide-react";
import { SignInButton } from "@clerk/clerk-react";

import Logo from "../ui/Logo";
import Button from "../ui/Button";

const navItems = [
  ["Features", "#features"],
  ["How it works", "#how-it-works"],
  ["Pricing", "#pricing"],
];

export default function Navbar() {
  const [open, setOpen] = useState(false);

  const closeMenu = () => {
    setOpen(false);
  };

  return (
    <header className="sticky top-0 z-50 border-b border-forest/10 bg-cream/95 backdrop-blur-sm">
      <div className="mx-auto flex h-18 w-[calc(100%-2.5rem)] max-w-7xl items-center justify-between md:w-[calc(100%-4rem)]">
        {/* Logo */}
        <Logo />

        {/* Desktop navigation */}
        <nav
          className="hidden items-center gap-8 lg:flex"
          aria-label="Main navigation"
        >
          {navItems.map(([label, href]) => (
            <a
              key={label}
              href={href}
              className="group relative py-2 text-[0.78rem] font-bold text-forest/70 transition-colors hover:text-forest"
            >
              {label}

              <span
                aria-hidden="true"
                className="absolute bottom-0 left-0 right-0 h-px origin-right scale-x-0 bg-rust transition-transform duration-200 group-hover:origin-left group-hover:scale-x-100"
              />
            </a>
          ))}
        </nav>

        {/* Desktop actions */}
        <div className="hidden items-center gap-3 lg:flex">
          <SignInButton forceRedirectUrl="/dashboard">
            <Button variant="secondary">
              Log in
            </Button>
          </SignInButton>

          <SignInButton forceRedirectUrl="/dashboard">
            <Button>
              Get Started
              <ArrowRight size={16} aria-hidden="true" />
            </Button>
          </SignInButton>
        </div>

        {/* Mobile menu button */}
        <button
          type="button"
          className="grid size-11 place-items-center border border-forest/20 lg:hidden"
          aria-label={open ? "Close menu" : "Open menu"}
          aria-expanded={open}
          aria-controls="mobile-navigation"
          onClick={() => setOpen((value) => !value)}
        >
          {open ? (
            <X size={21} aria-hidden="true" />
          ) : (
            <Menu size={21} aria-hidden="true" />
          )}
        </button>
      </div>

      {/* Mobile navigation */}
      {open && (
        <nav
          id="mobile-navigation"
          className="border-t border-forest/10 bg-cream px-5 py-5 lg:hidden"
          aria-label="Mobile navigation"
        >
          <div className="mx-auto flex max-w-7xl flex-col">
            {navItems.map(([label, href]) => (
              <a
                key={label}
                href={href}
                onClick={closeMenu}
                className="border-b border-forest/10 py-4 font-medium"
              >
                {label}
              </a>
            ))}

            <SignInButton forceRedirectUrl="/dashboard">
              <Button
                className="mt-5 w-full justify-center"
                onClick={closeMenu}
              >
                Start a Challenge
                <ArrowRight size={16} aria-hidden="true" />
              </Button>
            </SignInButton>
          </div>
        </nav>
      )}
    </header>
  );
}
