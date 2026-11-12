
import { useEffect, useRef, useState } from "react";
import { motion } from "motion/react";
import {
  Play,
  Pause,
  Volume2,
  VolumeX,
  Check,
} from "lucide-react";

const highlights = [
  "Spin a random technical topic",
  "Research with a focused timer",
  "Record your explanation",
  "Get detailed AI feedback",
];

const reveal = {
  hidden: { opacity: 0, y: 24 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.65, ease: [0.22, 1, 0.36, 1] as const },
  },
};

export default function DemoVideo() {
  const sectionRef = useRef<HTMLElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);

  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(true);

  useEffect(() => {
    const video = videoRef.current;
    const section = sectionRef.current;

    if (!video || !section) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          video.play().catch(() => {
            setIsPlaying(false);
          });
        } else {
          video.pause();
        }
      },
      { threshold: 0.4 }
    );

    observer.observe(section);

    return () => {
      observer.disconnect();
      video.pause();
    };
  }, []);

  const togglePlay = async () => {
    const video = videoRef.current;
    if (!video) return;

    if (video.paused) {
      try {
        await video.play();
      } catch {
        setIsPlaying(false);
      }
    } else {
      video.pause();
    }
  };

  const toggleMute = () => {
    const video = videoRef.current;
    if (!video) return;

    video.muted = !video.muted;
    setIsMuted(video.muted);
  };

  return (
    <section
      ref={sectionRef}
      id="demo"
      className="px-5 py-16 sm:px-8 md:py-20"
    >
      <div className="mx-auto max-w-7xl">
        <motion.div
          initial={{ opacity: 0, y: 35 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.15 }}
          transition={{ duration: 0.75, ease: [0.22, 1, 0.36, 1] }}
          className="relative overflow-hidden rounded-2xl bg-forest p-6 text-cream shadow-[0_8px_0_#dda15e] sm:p-8 md:p-10"
        >
          <div className="pointer-events-none absolute -right-20 -top-20 h-64 w-64 rounded-full bg-olive/30 blur-3xl" />

          <div className="relative z-10 grid grid-cols-1 items-center gap-10 lg:grid-cols-[0.85fr_1.4fr] lg:gap-12">
            <motion.div
              className="space-y-5"
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              transition={{ staggerChildren: 0.12 }}
            >
              <motion.div variants={reveal} className="flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-amber" />
                <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-amber sm:text-xs">
                  See it in action
                </p>
              </motion.div>

              <motion.h2
                variants={reveal}
                className="font-serif text-4xl leading-[1.05] sm:text-5xl"
              >
                From knowing to{" "}
                <span className="italic text-amber">explaining.</span>
              </motion.h2>

              <motion.p
                variants={reveal}
                className="max-w-md text-sm leading-relaxed text-cream/75 sm:text-base"
              >
                Watch how OffScripter turns technical knowledge
                into confident communication. Spin a topic,
                practice explaining, and get actionable AI feedback.
              </motion.p>

              <motion.div variants={reveal} className="space-y-3 pt-2">
                {highlights.map((item, index) => (
                  <motion.div
                    key={item}
                    initial={{ opacity: 0, x: -12 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: index * 0.08, duration: 0.4 }}
                    className="flex items-center gap-3 text-sm text-cream/90"
                  >
                    <Check size={17} className="shrink-0 text-amber" />
                    <span>{item}</span>
                  </motion.div>
                ))}
              </motion.div>

              <motion.p
                variants={reveal}
                className="pt-2 text-sm font-semibold text-amber"
              >
                Practice. Improve. Stand out.
              </motion.p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, scale: 0.96, x: 20 }}
              whileInView={{ opacity: 1, scale: 1, x: 0 }}
              viewport={{ once: true, amount: 0.2 }}
              transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
              className="group relative aspect-video w-full overflow-hidden rounded-xl border border-cream/20 bg-black shadow-2xl"
            >
              <video
                ref={videoRef}
                src="/videos/offscripter-demo.mp4"
                muted
                playsInline
                preload="metadata"
                onPlay={() => setIsPlaying(true)}
                onPause={() => setIsPlaying(false)}
                onEnded={() => setIsPlaying(false)}
                className="absolute inset-0 h-full w-full object-cover"
              />

              <div className="pointer-events-none absolute inset-x-0 bottom-0 h-28 bg-gradient-to-t from-black/75 to-transparent" />

              <motion.button
                type="button"
                onClick={togglePlay}
                aria-label={isPlaying ? "Pause video" : "Play video"}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.94 }}
                className="absolute inset-0 m-auto flex h-16 w-16 items-center justify-center rounded-full bg-rust/95 text-cream opacity-0 shadow-xl transition-all duration-300 hover:bg-rust focus:opacity-100 focus-visible:opacity-100 group-hover:opacity-100 sm:h-20 sm:w-20"
              >
                {isPlaying ? (
                  <Pause size={28} fill="currentColor" />
                ) : (
                  <Play size={28} fill="currentColor" className="ml-1" />
                )}
              </motion.button>

              <div className="absolute bottom-0 left-0 right-0 flex items-center justify-between p-3 sm:p-4">
                <div className="flex items-center gap-3">
                  <motion.button
                    type="button"
                    onClick={togglePlay}
                    aria-label={isPlaying ? "Pause video" : "Play video"}
                    whileHover={{ scale: 1.08 }}
                    whileTap={{ scale: 0.92 }}
                    className="flex h-10 w-10 items-center justify-center rounded-full bg-black/50 text-cream transition-colors hover:bg-rust"
                  >
                    {isPlaying ? (
                      <Pause size={18} fill="currentColor" />
                    ) : (
                      <Play size={18} fill="currentColor" />
                    )}
                  </motion.button>

                  <span className="text-xs font-medium text-cream">
                    Product walkthrough
                  </span>
                </div>

                <motion.button
                  type="button"
                  onClick={toggleMute}
                  aria-label={isMuted ? "Unmute video" : "Mute video"}
                  whileHover={{ scale: 1.08 }}
                  whileTap={{ scale: 0.92 }}
                  className="flex h-10 w-10 items-center justify-center rounded-full bg-black/50 text-cream transition-colors hover:bg-rust"
                >
                  {isMuted ? <VolumeX size={19} /> : <Volume2 size={19} />}
                </motion.button>
              </div>
            </motion.div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
