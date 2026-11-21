import { useCallback, useRef, useState } from "react";

export function useAudioRecorder(setError: (message: string) => void) {
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const mediaStreamRef = useRef<MediaStream | null>(null);
  const mediaChunksRef = useRef<Blob[]>([]);
  const [recordingReady, setRecordingReady] = useState(false);
  const [paused, setPaused] = useState(false);
  const stopMicrophone = useCallback(() => {
    mediaStreamRef.current?.getTracks().forEach(track => track.stop());
    mediaStreamRef.current = null;
  }, []);
  const startRecording = useCallback(async (isCurrent: () => boolean) => {
    if (!navigator.mediaDevices?.getUserMedia || !("MediaRecorder" in window)) {
      throw new Error("Your browser does not support audio recording.");
    }
    const stream = await navigator.mediaDevices.getUserMedia({audio:true});
    if (!isCurrent()) { stream.getTracks().forEach(track => track.stop()); return null; }
    mediaStreamRef.current = stream;
    try {
      const mimeType = ["audio/webm;codecs=opus", "audio/webm", "audio/mp4"].find(type => MediaRecorder.isTypeSupported(type));
      const recorder = mimeType ? new MediaRecorder(stream, {mimeType}) : new MediaRecorder(stream);
      mediaChunksRef.current = [];
      recorder.ondataavailable = event => { if (event.data.size > 0) mediaChunksRef.current.push(event.data); };
      recorder.onerror = () => setError("Something went wrong while recording your voice.");
      recorder.start(1000);
      mediaRecorderRef.current = recorder;
      setPaused(false);
      setRecordingReady(true);
      return stream;
    } catch (error) { stopMicrophone(); throw error; }
  }, [setError, stopMicrophone]);
  const stopRecording =
    useCallback((): Promise<Blob> => {
      return new Promise((resolve, reject) => {
        const recorder =
          mediaRecorderRef.current;

        if (!recorder) {
          reject(
            new Error(
              "Recording was not initialized.",
            ),
          );

          return;
        }

        if (recorder.state === "inactive") {
          const blob = new Blob(
            mediaChunksRef.current,
            {
              type:
                recorder.mimeType ||
                "audio/webm",
            },
          );

          resolve(blob);
          return;
        }

        recorder.onstop = () => {
          const blob = new Blob(
            mediaChunksRef.current,
            {
              type:
                recorder.mimeType ||
                "audio/webm",
            },
          );

          resolve(blob);
        };

        recorder.onerror = () => {
          reject(
            new Error(
              "Failed to stop the recording.",
            ),
          );
        };

        recorder.stop();
      });
    }, []);
  const togglePause = useCallback(() => {
    const recorder = mediaRecorderRef.current;
    if (recorder?.state === "recording") { recorder.pause(); setPaused(true); return "paused"; }
    if (recorder?.state === "paused") { recorder.resume(); setPaused(false); return "resumed"; }
    setError("Recording is not available.");
    return null;
  }, [setError]);
  const cleanupRecording = useCallback(() => {
    const recorder = mediaRecorderRef.current;
    if (recorder && recorder.state !== "inactive") recorder.stop();
    stopMicrophone();
  }, [stopMicrophone]);
  return {startRecording, stopRecording, stopMicrophone, cleanupRecording, togglePause, paused, recordingReady};
}
