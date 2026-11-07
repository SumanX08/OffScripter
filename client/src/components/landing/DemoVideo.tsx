
import { useEffect, useState } from "react";
import {
  Play,
  X,
  Check,
  ArrowUpRight,
} from "lucide-react";

const demoHighlights = [
  "Spin a random technical topic",
  "Research with a focused timer",
  "Record your explanation",
  "Get detailed AI feedback",
];

export default function DemoVideo() {
  const [isOpen, setIsOpen] = useState(false);

  const videoSrc = "/videos/offscripter-demo.mp4";

  useEffect(() => {
    if (!isOpen) return;

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setIsOpen(false);
      }
    };

    document.addEventListener("keydown", handleEscape);
    document.body.style.overflow = "hidden";

    return () => {
      document.removeEventListener("keydown", handleEscape);
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  return (
    <>
      <section
        id="demo"
        className="px-5 sm:px-8 py-16 md:py-20"
      >
        <div className="max-w-7xl mx-auto">
          <div className="relative overflow-hidden rounded-2xl bg-forest text-cream p-6 sm:p-8 md:p-10 shadow-[0_8px_0_#dda15e]">

            {/* Decorative background */}
            <div className="absolute -top-20 -right-20 w-64 h-64 rounded-full bg-olive/30 blur-3xl pointer-events-none" />

            <div className="relative z-10 grid grid-cols-1 lg:grid-cols-[0.85fr_1.4fr] gap-10 lg:gap-12 items-center">

              {/* Left content */}
              <div className="space-y-5">

                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-amber" />
                  <p className="text-amber uppercase tracking-[0.2em] text-[10px] sm:text-xs font-bold">
                    See it in action
                  </p>
                </div>

                <h2 className="font-serif text-4xl sm:text-5xl leading-[1.05]">
                  From knowing to{" "}
                  <span className="text-amber italic">
                    explaining.
                  </span>
                </h2>

                <p className="text-cream/75 text-sm sm:text-base leading-relaxed max-w-md">
                  Watch how OffScripter turns technical knowledge
                  into confident communication. Spin a topic,
                  practice explaining, and get actionable AI feedback.
                </p>

                {/* Highlights */}
                <div className="space-y-3 pt-2">
                  {demoHighlights.map((item) => (
                    <div
                      key={item}
                      className="flex items-center gap-3 text-sm text-cream/90"
                    >
                      <Check
                        size={17}
                        className="text-amber shrink-0"
                      />
                      <span>{item}</span>
                    </div>
                  ))}
                </div>

                <button
                  onClick={() => setIsOpen(true)}
                  className="inline-flex items-center gap-2 mt-3 text-amber text-sm font-semibold hover:text-soft transition-colors group"
                >
                  Watch product walkthrough
                  <ArrowUpRight
                    size={17}
                    className="group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform"
                  />
                </button>
              </div>

              {/* Video preview */}
              <button
                type="button"
                onClick={() => setIsOpen(true)}
                aria-label="Play OffScripter product demo"
                className="group relative w-full aspect-video rounded-xl overflow-hidden border border-cream/30 bg-cream/10 shadow-2xl text-left"
              >
                {/* Browser frame */}
                <div className="absolute inset-0 bg-cream p-2 sm:p-3">
                  <div className="h-full rounded-lg overflow-hidden border border-forest/10 bg-[#f8f1dc]">

                    {/* Browser header */}
                    <div className="h-9 sm:h-11 flex items-center justify-between px-3 sm:px-5 border-b border-forest/10 bg-soft">
                      <div className="flex items-center gap-2">
                        <div className="flex gap-1">
                          <span className="w-2 h-2 rounded-full bg-rust/70" />
                          <span className="w-2 h-2 rounded-full bg-amber" />
                          <span className="w-2 h-2 rounded-full bg-olive/50" />
                        </div>
                        <span className="text-[9px] sm:text-xs font-bold text-forest ml-2">
                          OffScripter
                        </span>
                      </div>

                      <span className="text-[8px] sm:text-[10px] text-olive">
                        🔥 12 day streak
                      </span>
                    </div>

                    {/* App preview */}
                    <div className="flex h-[calc(100%-36px)] sm:h-[calc(100%-44px)]">

                      {/* Sidebar */}
                      <div className="hidden sm:flex w-[23%] flex-col gap-4 p-4 border-r border-forest/10 text-[10px] text-olive">
                        <span>⌂ &nbsp; Home</span>
                        <span className="bg-mist text-forest rounded px-2 py-1 font-bold">
                          ◉ &nbsp; Practice
                        </span>
                        <span>▤ &nbsp; Progress</span>
                        <span>♧ &nbsp; Leaderboard</span>
                        <span>⚙ &nbsp; Settings</span>
                      </div>

                      {/* Main challenge */}
                      <div className="flex-1 p-4 sm:p-6 flex flex-col justify-center">
                        <p className="text-[9px] sm:text-xs text-olive mb-3">
                          YOUR CHALLENGE
                        </p>

                        <div className="flex gap-2 mb-3">
                          <span className="text-[8px] sm:text-[10px] bg-mist text-forest px-2 py-1 rounded">
                            Backend
                          </span>
                          <span className="text-[8px] sm:text-[10px] bg-mist text-forest px-2 py-1 rounded">
                            System Design
                          </span>
                        </div>

                        <h3 className="font-serif text-lg sm:text-2xl text-forest leading-tight max-w-md">
                          Explain how a load balancer works and its benefits.
                        </h3>

                        <div className="flex flex-wrap gap-3 mt-4 text-[8px] sm:text-[10px] text-olive">
                          <span>◷ Research · 5 min</span>
                          <span>♧ Explain · 2 min</span>
                        </div>

                        <div className="mt-5">
                          <span className="inline-flex bg-forest text-cream text-[9px] sm:text-xs px-4 py-2 rounded font-semibold">
                            Start Challenge →
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Video play overlay */}
                <div className="absolute inset-0 flex items-center justify-center bg-forest/10 group-hover:bg-forest/25 transition-colors">
                  <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-rust text-cream flex items-center justify-center shadow-xl group-hover:scale-110 transition-transform duration-300">
                    <Play
                      size={28}
                      fill="currentColor"
                      className="ml-1"
                    />
                  </div>
                </div>

                {/* Video duration */}
                <div className="absolute bottom-4 right-4 bg-forest/90 text-cream text-[10px] sm:text-xs px-3 py-1.5 rounded">
                  ▶ &nbsp; Watch demo
                </div>
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Video modal */}
      {isOpen && (
        <div
          className="fixed inset-0 z-[100] bg-forest/90 backdrop-blur-sm flex items-center justify-center p-4 sm:p-8"
          onClick={() => setIsOpen(false)}
          role="presentation"
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-label="OffScripter product demo"
            className="relative w-full max-w-5xl"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="flex justify-between items-center mb-4">
              <div>
                <p className="text-amber text-xs uppercase tracking-widest font-bold">
                  OffScripter walkthrough
                </p>
                <h3 className="text-cream font-serif text-xl sm:text-2xl mt-1">
                  From knowing to explaining.
                </h3>
              </div>

              <button
                onClick={() => setIsOpen(false)}
                aria-label="Close video"
                className="w-10 h-10 rounded-full border border-cream/30 text-cream flex items-center justify-center hover:bg-cream/10 transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            <div className="rounded-xl overflow-hidden bg-black border border-cream/20 shadow-2xl">
              <video
                src={videoSrc}
                controls
                autoPlay
                playsInline
                className="w-full aspect-video"
              >
                Your browser does not support video playback.
              </video>
            </div>

            <p className="text-cream/60 text-xs mt-3 text-center">
              Practice. Improve. Stand out.
            </p>
          </div>
        </div>
      )}
    </>
  );
}
