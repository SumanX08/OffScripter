import { motion } from "motion/react";
const waveformHeights = [
  18, 30, 42, 24, 52, 35, 64, 28,
  45, 72, 38, 58, 30, 68, 46, 24,
  55, 36, 70, 42, 25, 60, 34, 50,
  28, 66, 40, 58, 32, 48, 70, 35,
  52, 26, 62, 40, 72, 30, 54, 38,
];
export default function SpeakingWaveform({paused}: {paused:boolean}) {
return (        <motion.div
  initial={{ opacity: 0, y: 15 }}
  animate={{ opacity: paused ? 0.3 : 1, y: 0 }}
  transition={{ duration: 0.4, delay: 0.35 }}
  className={[
    "mt-12 flex h-[90px] items-center justify-center gap-[5px]",
    "sm:mt-14",
    paused ? "opacity-30" : "",
  ].join(" ")}
  aria-hidden="true"
>
          {waveformHeights.map(
            (height, index) => (
              <span
                key={index}
                className={[
                  "w-[4px] rounded-full bg-[#BF681C]",
                  !paused
                    ? "animate-[wave_900ms_ease-in-out_infinite]"
                    : "",
                ].join(" ")}
                style={{
                  height: `${height}%`,
                  animationDelay: `${
                    index * 35
                  }ms`,
                }}
              />
            ),
          )}
        </motion.div>);
}
