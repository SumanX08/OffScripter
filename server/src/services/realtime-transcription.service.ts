
import WebSocket from "ws";
import { env } from "../config/env.js";

type TranscriptionCallbacks = {
  onReady: () => void;
  onDelta: (delta: string) => void;
  onCompleted: (transcript: string) => void;
  onError: (error: Error) => void;
};

export const createRealtimeTranscription = (
  callbacks: TranscriptionCallbacks
) => {
  const startedAt = performance.now();

  let ready = false;
  let committed = false;
  let finished = false;

  let commitTime = 0;
  let totalAudioBytes = 0;
  let totalChunks = 0;

  let committedItemId: string | null = null;

  const completedItems = new Map<string, string>();

  const socket = new WebSocket(
    "wss://api.openai.com/v1/realtime?intent=transcription",
    {
      headers: {
        Authorization: `Bearer ${env.OPENAI_API_KEY}`,
      },
      handshakeTimeout: 10000,
    }
  );

  const fail = (error: Error) => {
    if (finished) return;

    finished = true;
    ready = false;

    console.error("[REALTIME ERROR]", error.message);

    callbacks.onError(error);

    socket.close();
  };

  const tryComplete = () => {
    if (
      finished ||
      !committed ||
      !committedItemId
    ) {
      return;
    }

    if (!completedItems.has(committedItemId)) {
      return;
    }

    const transcript =
      completedItems.get(committedItemId)!;

    finished = true;
    ready = false;

    console.log("[REALTIME] Final transcript received");

    console.log(
      "[PERF] OpenAI finalization:",
      (performance.now() - commitTime).toFixed(2),
      "ms"
    );

    console.log("[REALTIME METRICS]", {
      audioDurationSeconds:
        (totalAudioBytes / 48000).toFixed(2),
      totalChunks,
      transcriptCharacters: transcript.length,
    });

    callbacks.onCompleted(transcript);

    socket.close();
  };

  socket.on("open", () => {
    console.log(
      "[REALTIME] OpenAI connection established"
    );

    socket.send(
      JSON.stringify({
        type: "session.update",
        session: {
          type: "transcription",
          audio: {
            input: {
              format: {
                type: "audio/pcm",
                rate: 24000,
              },
              transcription: {
                model: "gpt-live-transcribe",
                languages: ["en"],
              },
              turn_detection: null,
            },
          },
        },
      })
    );
  });

  socket.on("message", (data) => {
    try {
      const event = JSON.parse(data.toString());

      if (
        event.type !==
        "conversation.item.input_audio_transcription.delta"
      ) {
        console.log(
          "[OPENAI EVENT]",
          event.type,
          {
            itemId: event.item_id,
            eventId: event.event_id,
          }
        );
      }

      switch (event.type) {
        case "session.updated": {
          if (ready || committed || finished) break;

          ready = true;

          console.log(
            "[PERF] Realtime session ready:",
            (performance.now() - startedAt).toFixed(2),
            "ms"
          );

          callbacks.onReady();
          break;
        }

        case "input_audio_buffer.committed": {
          if (!committed) break;

          committedItemId = event.item_id;

          console.log("[REALTIME] Commit acknowledged", {
            itemId: committedItemId,
            latency:
              (performance.now() - commitTime).toFixed(2),
          });

          tryComplete();
          break;
        }

        case "conversation.item.input_audio_transcription.delta": {
          if (committed) {
            console.log(
              "[REALTIME] Post-commit delta received"
            );
          }

          callbacks.onDelta(event.delta ?? "");
          break;
        }

        case "conversation.item.input_audio_transcription.completed": {
          console.log(
            "[REALTIME] Completion event received",
            {
              itemId: event.item_id,
              transcriptLength:
                event.transcript?.length ?? 0,
              committed,
            }
          );

          completedItems.set(
            event.item_id,
            event.transcript ?? ""
          );

          tryComplete();
          break;
        }

        case "conversation.item.input_audio_transcription.failed":
        case "error": {
          console.error(
            "[OPENAI ERROR EVENT]",
            JSON.stringify(event, null, 2)
          );

          fail(
            new Error(
              event.error?.message ??
                "Realtime transcription failed"
            )
          );

          break;
        }
      }
    } catch (error) {
      fail(
        error instanceof Error
          ? error
          : new Error("Invalid transcription event")
      );
    }
  });

  socket.on("error", fail);

  socket.on("close", (code, reason) => {
    ready = false;

    console.log("[REALTIME] OpenAI connection closed", {
      code,
      reason: reason.toString(),
      committed,
      finished,
    });

    if (!finished) {
      fail(
        new Error(
          "Transcription connection closed unexpectedly"
        )
      );
    }
  });

  const appendAudio = (audio: Buffer) => {
    if (
      !ready ||
      committed ||
      finished ||
      socket.readyState !== WebSocket.OPEN
    ) {
      throw new Error(
        "Transcription session is not accepting audio"
      );
    }

    if (socket.bufferedAmount > 1024 * 1024) {
      throw new Error(
        "Transcription connection is overloaded"
      );
    }

    totalAudioBytes += audio.length;
    totalChunks++;

    socket.send(
      JSON.stringify({
        type: "input_audio_buffer.append",
        audio: audio.toString("base64"),
      })
    );
  };

  const commit = () => {
    if (
      !ready ||
      committed ||
      finished ||
      socket.readyState !== WebSocket.OPEN
    ) {
      throw new Error(
        "Transcription cannot be finalized"
      );
    }

    committed = true;
    commitTime = performance.now();

    console.log("[REALTIME] Sending commit", {
      totalChunks,
      totalAudioBytes,
      audioDurationSeconds:
        (totalAudioBytes / 48000).toFixed(2),
      bufferedAmount: socket.bufferedAmount,
    });

    socket.send(
      JSON.stringify({
        type: "input_audio_buffer.commit",
      }),
      (error) => {
        if (error) {
          fail(error);
        } else {
          console.log("[REALTIME] Commit sent");
        }
      }
    );
  };

  const close = () => {
    finished = true;
    ready = false;

    socket.close();
  };

  return {
    appendAudio,
    commit,
    close,
    isReady: () => ready,
  };
};
