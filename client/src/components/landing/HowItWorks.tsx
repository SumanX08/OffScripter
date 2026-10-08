
import {
  Target,
  Search,
  Mic2,
  BarChart3,
} from "lucide-react";

const steps = [
  {
    number: "01",
    icon: Target,
    title: "Spin a Topic",
    description:
      "Get a random technical topic based on what you want to practice.",
  },
  {
    number: "02",
    icon: Search,
    title: "Research",
    description:
      "Take a few minutes to understand the topic and organize your thoughts.",
  },
  {
    number: "03",
    icon: Mic2,
    title: "Explain",
    description:
      "Explain the technical concept out loud for 2 minutes. One take.",
  },
  {
    number: "04",
    icon: BarChart3,
    title: "Get Feedback",
    description:
      "Review your speaking performance and find ways to improve your technical communication.",
  },
];

export default function HowItWorks() {
  return (
    <section
      id="how-it-works"
      aria-labelledby="how-it-works-heading"
      className="bg-cream px-6 py-20 md:px-10 lg:px-16"
    >
      <div className="mx-auto max-w-6xl">
        {/* Header */}
        <div className="mb-16 grid items-end gap-10 md:grid-cols-2">
          {/* Left */}
          <div>
            <p className="mb-6 text-xs font-bold uppercase tracking-[0.25em] text-rust">
              Four steps. One better speaker.
            </p>

            <h2
              id="how-it-works-heading"
              className="max-w-xl font-serif text-5xl leading-[0.95] text-forest md:text-6xl lg:text-7xl"
            >
              Learn by
              <br />
              explaining.
            </h2>
          </div>

          {/* Right */}
          <div className="max-w-lg md:justify-self-end">
            <p className="text-base leading-7 text-olive md:text-lg">
              No courses to finish. No scripts to memorize. Just deliberate
              practice that helps developers turn technical knowledge into
              clear communication and confidence.
            </p>
          </div>
        </div>

        {/* Steps */}
        <div className="grid overflow-hidden  bg-forest md:grid-cols-2 lg:grid-cols-4">
          {steps.map((step, index) => {
            const Icon = step.icon;

            return (
              <div
                key={step.number}
                className={`
                  group relative min-h-[270px] p-7 transition-colors
                  hover:bg-olive/20
                  ${
                    index !== steps.length - 1
                      ? "border-b border-cream/20 lg:border-b-0 lg:border-r"
                      : ""
                  }
                  ${
                    index === 1
                      ? "md:border-r-0 lg:border-r"
                      : ""
                  }
                `}
              >
                {/* Top row */}
                <div className="flex items-start justify-between">
                  {/* Icon */}
                  <div
                    className="flex h-14 w-14 items-center justify-center rounded-full bg-olive/50"
                    aria-hidden="true"
                  >
                    <Icon
                      size={28}
                      strokeWidth={1.7}
                      className="text-cream"
                    />
                  </div>

                  {/* Number */}
                  <span
                    className="text-sm font-medium text-amber"
                    aria-hidden="true"
                  >
                    {step.number}
                  </span>
                </div>

                {/* Content */}
                <div className="mt-8">
                  <h3 className="font-serif text-xl text-cream md:text-2xl">
                    {step.title}
                  </h3>

                  <p className="mt-3 max-w-xs text-sm leading-6 text-sage md:text-base">
                    {step.description}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
