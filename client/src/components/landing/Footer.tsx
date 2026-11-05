
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

const socialLinks = [
  { icon: X, href: "#", label: " X" },
];

export default function Footer() {
  return (
    <footer className="bg-forest px-6 pb-6 pt-14 text-cream md:px-12 lg:px-16">
      <div className="mx-auto max-w-6xl">

        {/* Main footer */}
        <div className="grid grid-cols-2 gap-x-8 gap-y-12 md:grid-cols-4 lg:grid-cols-[1.5fr_0.8fr_0.8fr_0.9fr_1.5fr] lg:gap-10">

          {/* Brand */}
          <div className="col-span-2 lg:col-span-1">
            <a
              href="/"
              className="mb-5 inline-flex items-center gap-2"
            >
              <Infinity size={25} strokeWidth={2.5} />
              <span className="font-sans text-lg font-extrabold tracking-tight">
                OffScripter
              </span>
            </a>

            <p className="max-w-[220px] font-sans text-xs leading-6 text-cream/65">
              Practice technical communication.
              Build confidence. Stand out.
            </p>

            {/* Social links */}
            <div className="mt-6 flex items-center gap-4">
              {socialLinks.map(({ icon: Icon, href, label }) => (
                <a
                  key={label}
                  href={href}
                  aria-label={label}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-cream/60 transition-colors hover:text-amber"
                >
                  <Icon size={17} strokeWidth={1.8} />
                </a>
              ))}
            </div>
          </div>

          {/* Navigation columns */}
          {Object.entries(footerLinks).map(([heading, links]) => (
            <div key={heading}>
              <h3 className="mb-5 font-sans text-xs font-extrabold text-cream">
                {heading}
              </h3>

              <ul className="space-y-3">
                {links.map((link) => (
                  <li key={link.label}>
                    <a
                      href={link.href}
                      className="font-sans text-xs text-cream/60 transition-colors hover:text-amber"
                    >
                      {link.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}

          {/* Newsletter / CTA */}
          <div className="col-span-2 md:col-span-1">
            <h3 className="mb-3 font-sans text-xs font-extrabold text-cream">
              Ready to stand out?
            </h3>

            <p className="mb-5 max-w-xs font-sans text-xs leading-6 text-cream/60">
              Stop just knowing things. Start explaining them.
              Build your speaking habit with OffScripter.
            </p>

            <a
              href="/signup"
              className="group inline-flex w-full items-center justify-between border border-cream/20 px-4 py-3 font-sans text-xs font-bold text-cream transition-all hover:border-amber hover:bg-amber hover:text-forest"
            >
              Start your first challenge

              <ArrowUpRight
                size={16}
                className="transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5"
              />
            </a>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="mt-14 flex flex-col gap-4 border-t border-cream/15 pt-6 sm:flex-row sm:items-center sm:justify-between">
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
        </div>
      </div>
    </footer>
  );
}
