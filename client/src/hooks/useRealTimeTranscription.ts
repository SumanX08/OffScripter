
import { useCallback, useEffect, useRef } from "react";
import { useAuth } from "@clerk/clerk-react";

type RealtimeSession = {
  socket: WebSocket;
  context: AudioContext;
  source: MediaStreamAudioSourceNode;
  worklet: AudioWorkletNode;
  silentGain: GainNode;
  ready: boolean;
  failed: boolean;
  pendingAudio: ArrayBuffer[];
  resolveFinal?: (transcript: string) => void;
  rejectFinal?: (error: Error) => void;
};

export const useRealtimeTranscription = () => {
  const { getToken } = useAuth();

  const sessionRef = useRef<RealtimeSession | null>(
    null
  );

  const cleanup = useCallback(() => {
    const session = sessionRef.current;

    if (!session) return;

    sessionRef.current = null;

    session.ready = false;
    session.pendingAudio = [];

    session.worklet.port.onmessage = null;

    session.source.disconnect();
    session.worklet.disconnect();
    session.silentGain.disconnect();

    if (session.context.state !== "closed") {
      void session.context.close().catch(console.error);
    }

    if (
      session.socket.readyState === WebSocket.OPEN ||
      session.socket.readyState === WebSocket.CONNECTING
    ) {
      session.socket.close();
    }
  }, []);

  const startTranscription = useCallback(
    async (stream: MediaStream, attemptId: string) => {
      cleanup();

      const token = await getToken();

      if (!token) {
        throw new Error("Authentication required");
      }

      const context = new AudioContext({
        sampleRate: 24000,
      });

      try {
        if (context.sampleRate !== 24000) {
          throw new Error("Unsupported audio sample rate");
        }

        await context.audioWorklet.addModule(
          "/audio-processor.js"
        );

        const source =
          context.createMediaStreamSource(stream);

        const worklet = new AudioWorkletNode(
          context,
          "pcm-processor",
          {
            channelCount: 1,
            channelCountMode: "explicit",
          }
        );

        const silentGain = context.createGain();

        silentGain.gain.value = 0;

        const socket = new WebSocket(
          import.meta.env.VITE_WS_URL
        );

        const session: RealtimeSession = {
          socket,
          context,
          source,
          worklet,
          silentGain,
          ready: false,
          failed: false,
          pendingAudio: [],
        };

        sessionRef.current = session;

        const fail = (error: Error) => {
          session.failed = true;
          console.error("[REALTIME]", error);

          session.rejectFinal?.(error);

          if (sessionRef.current === session) {
            cleanup();
          }
        };

        const setupTimeout = setTimeout(() => {
          fail(new Error("Realtime setup timed out"));
        }, 15000);

        const sendAudio = (audio: ArrayBuffer) => {
          if (socket.bufferedAmount > 1024 * 1024) {
            fail(new Error("Audio connection overloaded"));
            return;
          }

          socket.send(audio);
        };

        socket.onopen = () => {
          socket.send(
            JSON.stringify({
              type: "start",
              token,
              attemptId,
            })
          );
        };

        socket.onmessage = (event) => {
          try {
            const message = JSON.parse(event.data);

            switch (message.type) {
              case "ready":
                clearTimeout(setupTimeout);

                session.ready = true;

                console.log(
                  "[REALTIME] Ready to stream"
                );

                for (const audio of session.pendingAudio) {
                  if (session.failed) break;
                  sendAudio(audio);
                }

                session.pendingAudio = [];
                break;

              case "delta":
                console.log(
                  "[TRANSCRIPT DELTA]",
                  message.delta
                );
                break;

              case "completed":
                clearTimeout(setupTimeout);

                session.resolveFinal?.(
                  message.transcript
                );

                cleanup();
                break;

              case "error":
                clearTimeout(setupTimeout);

                fail(new Error(message.message));
                break;
            }
          } catch {
            fail(new Error("Invalid WebSocket response"));
          }
        };

        socket.onerror = () => {
          clearTimeout(setupTimeout);

          fail(new Error("WebSocket connection failed"));
        };

        socket.onclose = () => {
          clearTimeout(setupTimeout);

          if (sessionRef.current === session) {
            fail(new Error("WebSocket disconnected"));
          }
        };

        worklet.port.onmessage = (event) => {
          if (
            session.failed ||
            sessionRef.current !== session
          ) {
            return;
          }

          if (event.data.type === "audio") {
            const audio = event.data.buffer as ArrayBuffer;

            if (
              session.ready &&
              socket.readyState === WebSocket.OPEN
            ) {
              sendAudio(audio);
            } else {
              // Buffer up to 5 seconds during setup.
              if (session.pendingAudio.length >= 50) {
                fail(new Error("Realtime setup too slow"));
                return;
              }

              session.pendingAudio.push(audio);
            }
          }

          if (event.data.type === "flushed") {
            if (
              session.ready &&
              socket.readyState === WebSocket.OPEN
            ) {
              socket.send(
                JSON.stringify({ type: "commit" })
              );
            } else {
              fail(new Error("Realtime session unavailable"));
            }
          }
        };

        source.connect(worklet);
        worklet.connect(silentGain);
        silentGain.connect(context.destination);

        await context.resume();

        console.log("[REALTIME] Audio capture started");
      } catch (error) {
        cleanup();

        if (context.state !== "closed") {
          await context.close();
        }

        throw error;
      }
    },
    [getToken, cleanup]
  );

  const stopTranscription = useCallback(
    (): Promise<string> => {
      const session = sessionRef.current;

      if (
        !session ||
        session.failed ||
        !session.ready
      ) {
        cleanup();

        return Promise.reject(
          new Error("Realtime session unavailable")
        );
      }

      return new Promise((resolve, reject) => {
        const start = performance.now();

        const timeout = setTimeout(() => {
          cleanup();
          reject(new Error("Finalization timed out"));
        }, 15000);

        session.resolveFinal = (transcript) => {
          clearTimeout(timeout);

          console.log(
            "[PERF] Client finalization:",
            (performance.now() - start).toFixed(2),
            "ms"
          );

          resolve(transcript);
        };

        session.rejectFinal = (error) => {
          clearTimeout(timeout);
          reject(error);
        };

        session.worklet.port.postMessage({
          type: "flush",
        });
      });
    },
    [cleanup]
  );

  useEffect(() => cleanup, [cleanup]);

  return {
    startTranscription,
    stopTranscription,
    cancelTranscription: cleanup,
  };
};
