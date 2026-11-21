import { useEffect, useState } from "react";
export function useSpeakingTimer(running: boolean) {
  const [timeLeft, setTimeLeft] = useState(0);
  const [elapsedTime, setElapsedTime] = useState(0);
  const active = running && timeLeft > 0;
  useEffect(() => {
    if (!active) return;
    const interval = window.setTimeout(() => {
      setTimeLeft(prev => Math.max(prev - 1, 0));
      setElapsedTime(prev => prev + 1);
    }, 1000);
    return () => window.clearTimeout(interval);
  }, [active, timeLeft]);
  return {timeLeft, elapsedTime, setTimeLeft, setElapsedTime};
}
