
import { motion } from "motion/react";
import {
  ArrowRight,
  ArrowUpRight,
  X,
  Infinity,
} from "lucide-react";

const footerLinks = {
  Product: [
    { label: "Features", href: "#features" },
    { label: "How it works", href: "#how-it-works" },
    { label: "Pricing", href: "#pricing" },
    { label: "FAQ", href: "#faq" },
  ],
  Resources: [
    { label: "Blog", href: "/blog" },
    { label: "Guides", href: "/guides" },
    { label: "Changelog", href: "/changelog" },
  ],
  Company: [
    { label: "About", href: "/about" },
    { label: "Contact", href: "/contact" },
    { label: "Privacy Policy", href: "/privacy" },
    { label: "Terms of Service", href: "/terms" },
  ],
};

const socialLinks = [{ icon: X, href: "#", label: "X" }];

const reveal = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.55, ease: [0.22, 1, 0.36, 1] as const },
  },
};

export default function Footer() {
  return (
    <footer className="bg-forest px-6 pb-6 pt-14 text-cream md:px-12 lg:px-16">
      <div className="mx-auto max-w-6xl">
        <motion.div
          className="grid grid-cols-2 gap-x-8 gap-y-12 md:grid-cols-4 lg:grid-cols-[1.5fr_0.8fr_0.8fr_0.9fr_1.5fr] lg:gap-10"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.1 }}
          transition={{ staggerChildren: 0.12 }}
        >
          <motion.div variants={reveal} className="col-span-2 lg:col-span-1">
            <a href="/" className="mb-5 inline-flex items-center gap-2">
              <Infinity size={25} strokeWidth={2.5} />
              <span className="font-sans text-lg font-extrabold tracking-tight">
                OffScripter
              </span>
            </a>

            <p className="max-w-[220px] font-sans text-xs leading-6 text-cream/65">
              Practice technical communication.
              Build confidence. Stand out.
            </p>

            <div className="mt-6 flex items-center gap-4">
              {socialLinks.map(({ icon: Icon, href, label }) => (
                <motion.a
                  key={label}
                  href={href}
                  aria-label={label}
                  target="_blank"
                  rel="noopener noreferrer"
                  whileHover={{ y: -3, scale: 1.1 }}
                  transition={{ duration: 0.2 }}
                  className="text-cream/60 transition-colors hover:text-amber"
                >
                  <Icon size={17} strokeWidth={1.8} />
                </motion.a>
              ))}
            </div>
          </motion.div>

          {Object.entries(footerLinks).map(([heading, links]) => (
            <motion.div key={heading} variants={reveal}>
              <h3 className="mb-5 font-sans text-xs font-extrabold text-cream">
                {heading}
              </h3>

              <ul className="space-y-3">
                {links.map((link) => (
                  <li key={link.label}>
                    <motion.a
                      href={link.href}
                      whileHover={{ x: 4 }}
                      transition={{ duration: 0.2 }}
                      className="inline-block font-sans text-xs text-cream/60 transition-colors hover:text-amber"
                    >
                      {link.label}
                    </motion.a>
                  </li>
                ))}
              </ul>
            </motion.div>
          ))}

          <motion.div
            variants={reveal}
            className="col-span-2 md:col-span-1"
          >
            <h3 className="mb-3 font-sans text-xs font-extrabold text-cream">
              Ready to stand out?
            </h3>

            <p className="mb-5 max-w-xs font-sans text-xs leading-6 text-cream/60">
              Stop just knowing things. Start explaining them.
              Build your speaking habit with OffScripter.
            </p>

            <motion.a
              href="/signup"
              whileHover={{ y: -3 }}
              whileTap={{ scale: 0.98 }}
              className="group inline-flex w-full items-center justify-between border border-cream/20 px-4 py-3 font-sans text-xs font-bold text-cream transition-all hover:border-amber hover:bg-amber hover:text-forest"
            >
              Start your first challenge

              <ArrowUpRight
                size={16}
                className="transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5"
              />
            </motion.a>
          </motion.div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="mt-14 flex flex-col gap-4 border-t border-cream/15 pt-6 sm:flex-row sm:items-center sm:justify-between"
        >
          <p className="font-sans text-[11px] text-cream/50">
            © {new Date().getFullYear()} OffScripter. All rights reserved.
          </p>

          <div className="flex items-center gap-2 font-sans text-[11px] text-cream/50">
            Built for people who love to learn.
            <span className="text-rust">✳</span>
          </div>

          <a
            href="#top"
            className="inline-flex items-center gap-2 font-sans text-[11px] font-semibold text-cream/70 transition-colors hover:text-amber"
          >
            Back to top
            <ArrowRight size={13} className="-rotate-90" />
          </a>
        </motion.div>
      </div>
    </footer>
  );
}
