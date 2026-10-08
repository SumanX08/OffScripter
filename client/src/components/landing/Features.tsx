
import {
  RefreshCw,
  Timer,
  Activity,
  GitBranch,
  ArrowUpRight,
} from "lucide-react";

const features = [
  {
    icon: RefreshCw,
    title: "A fresh technical topic, every time",
    description:
      "Practice explaining random topics across frontend, backend, databases, AI, and the wider tech stack.",
  },
  {
    icon: Timer,
    title: "Focused preparation time",
    description:
      "Set aside a few focused minutes to research the topic and organize your thoughts before speaking.",
  },
  {
    icon: Activity,
    title: "Feedback with substance",
    description:
      "Get insights into technical depth, fluency, structure, clarity, and other speaking skills.",
  },
  {
    icon: GitBranch,
    title: "Progress you can feel",
    description:
      "Build a consistent technical speaking habit with streaks, milestones, and meaningful progress.",
  },
];

export default function Features() {
  return (
    <section
      id="features"
      aria-labelledby="features-heading"
      className="bg-cream px-6 py-24 md:px-10 lg:px-16"
    >
      <div className="mx-auto grid max-w-6xl gap-16 lg:grid-cols-2 lg:items-center lg:gap-24">
        {/* Left Content */}
        <div>
          {/* Eyebrow */}
          <div className="mb-7 flex items-center gap-3">
            <span
              className="h-2 w-2 rounded-full bg-rust"
              aria-hidden="true"
            />

            <span className="text-xs font-bold uppercase tracking-[0.18em] text-forest">
              A different kind of practice
            </span>
          </div>

          {/* Heading */}
          <h2
            id="features-heading"
            className="max-w-xl font-serif text-4xl leading-[0.95] text-forest md:text-5xl"
          >
            Knowing something
            <br />
            isn't the same as
            <br />
            <span className="text-rust">explaining it.</span>
          </h2>

          {/* Description */}
          <p className="mt-8 max-w-lg text-base leading-7 text-olive md:text-md">
            OffScripter turns passive technical knowledge into active
            communication practice. Practice explaining technical concepts
            clearly, build confidence, and become a better technical
            communicator.
          </p>

          {/* CTA */}
          <a
            href="#how-it-works"
            className="group mt-8 inline-flex items-center gap-3 text-sm font-bold text-forest transition-colors hover:text-rust"
          >
            Meet your new practice ground

            <ArrowUpRight
              size={20}
              strokeWidth={1.8}
              className="transition-transform duration-200 group-hover:translate-x-1 group-hover:-translate-y-1"
              aria-hidden="true"
            />
          </a>
        </div>

        {/* Right Features */}
        <div>
          <div className="border-t border-olive/25">
            {features.map((feature) => {
              const Icon = feature.icon;

              return (
                <div
                  key={feature.title}
                  className="group flex items-center gap-5 border-b border-olive/25 py-3"
                >
                  {/* Icon */}
                  <div
                    className="flex h-11 w-11 shrink-0 items-center justify-center border border-olive/25 bg-cream transition-colors duration-200 group-hover:bg-mist"
                    aria-hidden="true"
                  >
                    <Icon
                      size={20}
                      strokeWidth={1.7}
                      className="text-olive"
                    />
                  </div>

                  {/* Text */}
                  <div className="min-w-0 flex-1">
                    <h3 className="text-sm font-bold text-forest md:text-base">
                      {feature.title}
                    </h3>

                    <p className=" text-xs leading-5 text-olive md:text-sm">
                      {feature.description}
                    </p>
                  </div>

                  {/* Arrow */}
                  <ArrowUpRight
                    size={19}
                    strokeWidth={1.7}
                    className="shrink-0 text-rust transition-transform duration-200 group-hover:translate-x-1 group-hover:-translate-y-1"
                    aria-hidden="true"
                  />
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
