
import { motion } from "motion/react";
import { ArrowRight, Check } from "lucide-react";

const plans = [
  {
    name: "FREE",
    subtitle: "Build the habit",
    price: "₹0",
    features: [
      "2 technical speaking challenges/day",
      "Basic speaking feedback",
      "Progress tracking",
    ],
    button: "Start Free",
    href: "#top",
    featured: false,
  },
  {
    name: "PRO",
    subtitle: "Serious daily practice",
    price: "₹199",
    period: "/month",
    features: [
      "Unlimited technical speaking challenges",
      "Detailed AI feedback",
      "Streaks & leaderboards",
      "Advanced speaking analytics",
    ],
    button: "Choose Pro",
    href: "#top",
    featured: true,
  },
  {
    name: "TEAM",
    subtitle: "Practice together",
    price: "Custom",
    features: [
      "Team leaderboard",
      "Custom technical topics",
      "Priority support",
    ],
    button: "Talk to us",
    href: "#contact",
    featured: false,
  },
];

const reveal = {
  hidden: { opacity: 0, y: 28 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.65, ease: [0.22, 1, 0.36, 1] as const },
  },
};

export default function Pricing() {
  return (
    <section
      id="pricing"
      aria-labelledby="pricing-heading"
      className="border-t border-forest/10 bg-cream px-6 py-18 md:px-10 lg:px-16"
    >
      <div className="mx-auto max-w-7xl">
        <motion.div
          className="mx-auto max-w-3xl text-center"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.3 }}
          transition={{ staggerChildren: 0.15 }}
        >
          <motion.h2
            id="pricing-heading"
            variants={reveal}
            className="mt-6 font-serif text-5xl leading-[0.95] text-forest md:text-4xl lg:text-6xl"
          >
            Practice at your own pace.
          </motion.h2>

          <motion.p
            variants={reveal}
            className="mx-auto mt-7 max-w-xl text-base leading-7 text-olive md:text-lg"
          >
            Start free, build a consistent technical speaking habit, then
            unlock deeper AI feedback and advanced analytics when you're ready.
          </motion.p>
        </motion.div>

        <motion.div
          className="mt-8 grid gap-5 lg:grid-cols-3"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.15 }}
          transition={{ staggerChildren: 0.16 }}
        >
          {plans.map((plan) => (
            <motion.div
              key={plan.name}
              variants={reveal}
              whileHover={{ y: -7 }}
              transition={{ duration: 0.25 }}
              className={`relative flex min-h-[440px] flex-col border p-7 md:p-8 ${
                plan.featured
                  ? "border-forest bg-forest text-cream shadow-[8px_8px_0_#dda15e]"
                  : "border-forest/20 bg-cream"
              }`}
            >
              {plan.featured && (
                <div className="absolute right-5 top-5 bg-amber px-4 py-2 text-[9px] font-bold uppercase tracking-[0.12em] text-forest">
                  Most focused
                </div>
              )}

              <div>
                <p
                  className={`text-sm font-bold tracking-wide ${
                    plan.featured ? "text-cream" : "text-forest"
                  }`}
                >
                  {plan.name}
                </p>

                <p
                  className={`mt-2 text-sm ${
                    plan.featured ? "text-sage" : "text-olive"
                  }`}
                >
                  {plan.subtitle}
                </p>
              </div>

              <div className="mt-6 flex items-baseline">
                <span
                  className={`font-serif text-4xl md:text-5xl ${
                    plan.featured ? "text-cream" : "text-forest"
                  }`}
                >
                  {plan.price}
                </span>

                {plan.period && (
                  <span
                    className={`ml-1 text-xs ${
                      plan.featured ? "text-sage" : "text-olive"
                    }`}
                  >
                    {plan.period}
                  </span>
                )}
              </div>

              <div
                className={`my-7 h-px ${
                  plan.featured ? "bg-cream/20" : "bg-forest/15"
                }`}
              />

              <ul className="space-y-4">
                {plan.features.map((feature) => (
                  <li
                    key={feature}
                    className="flex items-center gap-3 text-sm"
                  >
                    <Check
                      size={16}
                      strokeWidth={2}
                      className="shrink-0 text-rust"
                      aria-hidden="true"
                    />

                    <span
                      className={plan.featured ? "text-cream" : "text-olive"}
                    >
                      {feature}
                    </span>
                  </li>
                ))}
              </ul>

              <a
                href={plan.href}
                className={`group mt-auto flex h-11 w-full items-center justify-center gap-2 border text-sm font-bold transition-all ${
                  plan.featured
                    ? "border-rust bg-rust text-cream hover:bg-amber hover:text-forest"
                    : "border-forest/20 text-forest hover:border-forest hover:bg-forest hover:text-cream"
                }`}
              >
                {plan.button}

                <motion.span
                  className="inline-flex"
                  whileHover={{ x: 4 }}
                  transition={{ duration: 0.2 }}
                >
                  <ArrowRight size={17} strokeWidth={1.8} aria-hidden="true" />
                </motion.span>
              </a>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
