import { motion } from "motion/react";
import { Pause, Play, Square } from "lucide-react";
import { formatTime } from "../../utils/formatTime";
export default function SpeakingControls({paused,timeLeft,elapsedTime,recordingReady,finalized,onPauseToggle,onEndSession}: {paused:boolean;timeLeft:number;elapsedTime:number;recordingReady:boolean;finalized:boolean;onPauseToggle:()=>void;onEndSession:()=>void}) {
return (<motion.div
  className="mt-12 flex items-center justify-center gap-5 sm:mt-14 sm:gap-6"
  initial={{ opacity: 0, y: 20 }}
  animate={{ opacity: 1, y: 0 }}
  transition={{ duration: 0.5, delay: 0.45 }}
>
          {/* Pause */}

          <motion.button
            whileHover={{ scale: 1.07 }}
  whileTap={{ scale: 0.94 }}
            type="button"
            onClick={
              onPauseToggle
            }
            disabled={
              timeLeft === 0 ||
              finalized ||
              !recordingReady
            }
            aria-label={
              paused
                ? "Resume speaking"
                : "Pause speaking"
            }
            className="flex h-[60px] w-[60px] items-center justify-center rounded-full bg-[#E9EDC9] text-[#263911] shadow-[0_8px_20px_rgba(35,49,17,0.06)] transition hover:scale-105 hover:bg-[#E1E7BD] disabled:cursor-not-allowed disabled:opacity-50 sm:h-[62px] sm:w-[62px]"
          >
            {paused ? (
              <Play
                size={19}
                fill="currentColor"
              />
            ) : (
              <Pause
                size={19}
                fill="currentColor"
              />
            )}
          </motion.button>

          {finalized ? <button type="button" onClick={onEndSession} className="rounded-lg bg-[#BF681C] px-5 py-3 font-semibold text-white">Retry submission</button> : (

          <motion.button
          whileHover={{ scale: 1.05 }}
  whileTap={{ scale: 0.94 }}
            type="button"
            onClick={
              onEndSession
            }
            disabled={
              finalized ||
              !recordingReady
            }
            aria-label={finalized ? "Retry submission" : "End speaking session"}
            className="flex h-[100px] w-[100px] items-center justify-center rounded-full bg-[#BF681C] text-white shadow-[0_14px_30px_rgba(191,104,28,0.22)] transition hover:scale-[1.04] hover:bg-[#AD5B16] disabled:cursor-not-allowed disabled:opacity-50 sm:h-[102px] sm:w-[102px]"
          >
            <span className="flex h-7 w-7 items-center justify-center rounded-[3px] bg-white">
              <Square
                size={15}
                fill="#BF681C"
                strokeWidth={0}
              />
            </span>
          </motion.button>)}

          {/* Elapsed */}

          <span className="min-w-[48px] text-left font-mono text-[14px] text-[#263911]/35">
            {formatTime(elapsedTime)}
          </span>
        </motion.div>);
}
