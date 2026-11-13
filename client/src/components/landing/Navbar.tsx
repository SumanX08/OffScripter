
import { useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { ArrowRight, Menu, X } from "lucide-react";
import {
  SignInButton,
  SignUpButton,
} from "@clerk/clerk-react";
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
    <motion.header
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{
        duration: 0.6,
        ease: [0.22, 1, 0.36, 1],
      }}
      className="sticky top-0 z-50 border-b border-forest/10 bg-cream/95 backdrop-blur-sm"
    >
      <div className="mx-auto flex h-18 w-[calc(100%-2.5rem)] max-w-7xl items-center justify-between md:w-[calc(100%-4rem)]">
        {/* Logo */}
        <Logo />

        {/* Desktop navigation */}
        <nav
          className="hidden items-center gap-8 lg:flex"
          aria-label="Main navigation"
        >
          {navItems.map(([label, href], index) => (
            <motion.a
              key={label}
              href={href}
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15 + index * 0.08 }}
              className="group relative py-2 text-[0.78rem] font-bold text-forest/70 transition-colors hover:text-forest"
            >
              {label}

              <span
                aria-hidden="true"
                className="absolute bottom-0 left-0 right-0 h-px origin-right scale-x-0 bg-rust transition-transform duration-200 group-hover:origin-left group-hover:scale-x-100"
              />
            </motion.a>
          ))}
        </nav>

        {/* Desktop actions */}
        <motion.div
          className="hidden items-center gap-3 lg:flex"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
        >
          <SignInButton forceRedirectUrl="/dashboard">
            <Button variant="secondary">
              Log in
            </Button>
          </SignInButton>

          <SignUpButton forceRedirectUrl="/onboarding">
  <Button>
    Get Started
    <ArrowRight size={16} aria-hidden="true" />
  </Button>
</SignUpButton>
        </motion.div>

        {/* Mobile menu button */}
        <motion.button
          type="button"
          whileTap={{ scale: 0.9 }}
          className="grid size-11 place-items-center border border-forest/20 lg:hidden"
          aria-label={open ? "Close menu" : "Open menu"}
          aria-expanded={open}
          aria-controls="mobile-navigation"
          onClick={() => setOpen((value) => !value)}
        >
          <AnimatePresence mode="wait" initial={false}>
            <motion.span
              key={open ? "close" : "menu"}
              initial={{ opacity: 0, rotate: -90, scale: 0.8 }}
              animate={{ opacity: 1, rotate: 0, scale: 1 }}
              exit={{ opacity: 0, rotate: 90, scale: 0.8 }}
              transition={{ duration: 0.18 }}
              className="flex"
            >
              {open ? (
                <X size={21} aria-hidden="true" />
              ) : (
                <Menu size={21} aria-hidden="true" />
              )}
            </motion.span>
          </AnimatePresence>
        </motion.button>
      </div>

      {/* Mobile navigation */}
      <AnimatePresence>
        {open && (
          <motion.nav
            id="mobile-navigation"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
            className="overflow-hidden border-t border-forest/10 bg-cream px-5 py-5 lg:hidden"
            aria-label="Mobile navigation"
          >
            <div className="mx-auto flex max-w-7xl flex-col">
              {navItems.map(([label, href], index) => (
                <motion.a
                  key={label}
                  href={href}
                  onClick={closeMenu}
                  initial={{ opacity: 0, x: -12 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.07 }}
                  className="border-b border-forest/10 py-4 font-medium"
                >
                  {label}
                </motion.a>
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
          </motion.nav>
        )}
      </AnimatePresence>
    </motion.header>
  );
}
