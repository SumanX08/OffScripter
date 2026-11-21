import { motion } from "motion/react";
import { formatTime } from "../../utils/formatTime";
export default function SpeakingTimer({timeLeft, paused, recordingReady, finalized}: {timeLeft:number; paused:boolean; recordingReady:boolean; finalized:boolean}) {
return (       <motion.section
  className="mt-10 text-center sm:mt-12"
  initial={{ opacity: 0, scale: 0.92 }}
  animate={{ opacity: 1, scale: 1 }}
  transition={{
    duration: 0.55,
    delay: 0.25,
    ease: "easeOut",
  }}
>
          <div
            className={[
              "font-serif text-[82px] leading-none tracking-[-0.07em]",
              "sm:text-[110px]",
              "lg:text-[75px]",
              timeLeft <= 10
                ? "text-[#BF681C]"
                : "text-[#263911]",
            ].join(" ")}
          >
            {formatTime(timeLeft)}
          </div>

          {/* Recording status */}

          <div className="mt-8 flex items-center justify-center gap-2">
            <span
              className={[
                "h-3 w-3 rounded-full",
                paused || finalized || !recordingReady
                  ? "bg-[#9B9179]"
                  : "animate-pulse bg-[#DDA15E]",
              ].join(" ")}
            />

           <motion.span
  key={finalized ? "finalized" : paused ? "paused" : recordingReady ? "recording" : "unavailable"}
  initial={{ opacity: 0, y: 5 }}
  animate={{ opacity: 1, y: 0 }}
  transition={{ duration: 0.2 }}
  className="text-[16px] font-medium text-[#263911]/55"
>
  {finalized
    ? "Recording finished"
    : paused
      ? "Paused"
      : recordingReady ? "Recording" : "Microphone unavailable"}
</motion.span>
          </div>
       </motion.section>);
}
