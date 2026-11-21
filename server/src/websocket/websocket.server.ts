
import type { Server } from "node:http";
import WebSocket, { WebSocketServer } from "ws";
import { createClerkClient } from "@clerk/backend";
import { z } from "zod";

import { env } from "../config/env.js";
import { prisma } from "../config/prisma.js";
import { getUserByClerkId } from "../services/user.service.js";
import { createRealtimeTranscription } from
  "../services/realtime-transcription.service.js";
  import { saveRealtimeTranscript } from
  "../services/realtime-transcript.store.js";

const clerk = createClerkClient({
  secretKey: env.CLERK_SECRET_KEY,
  publishableKey: env.CLERK_PUBLISHABLE_KEY,
});

const frontendOrigin = new URL(env.FRONTEND_URL).origin;

const activeAttempts = new Set<string>();

const startSchema = z.object({
  type: z.literal("start"),
  token: z.string().min(1),
  attemptId: z.string().min(1),
});

type Session = ReturnType<
  typeof createRealtimeTranscription
>;

type ConnectionState =
  | "IDLE"
  | "AUTHENTICATING"
  | "CONNECTING"
  | "STREAMING"
  | "FINALIZING"
  | "CLOSED";

export const initializeWebSocketServer = (
  server: Server
) => {
  const wss = new WebSocketServer({
    noServer: true,
    maxPayload: 64 * 1024,
    perMessageDeflate: false,
  });

  server.on("upgrade", (req, socket, head) => {
    const pathname = new URL(
      req.url ?? "/",
      "http://localhost"
    ).pathname;

    if (pathname !== "/ws/transcription") {
      socket.destroy();
      return;
    }

    // WebSocket requests do not use Express CORS.
    if (req.headers.origin !== frontendOrigin) {
      socket.write(
        "HTTP/1.1 403 Forbidden\r\n\r\n"
      );
      socket.destroy();
      return;
    }

    wss.handleUpgrade(req, socket, head, (ws) => {
      wss.emit("connection", ws, req);
    });
  });

  wss.on("connection", (ws) => {
    console.log("[WS] Client connected");

    let state: ConnectionState = "IDLE";

    let realtimeSession: Session | null = null;
    let activeAttemptId: string | null = null;
    let activeUserId: string | null = null;
    let speakingEndedAt: Date | null = null;
    let receivedBytes = 0;
    let maxAudioBytes = 0;
    let streamingStartedAt = 0;
    let commitStartedAt = 0;

    let sessionTimeout:
      ReturnType<typeof setTimeout> | undefined;

    const authenticationTimeout = setTimeout(() => {
      fail("Authentication timeout");
    }, 20000);

    const send = (
      payload: Record<string, unknown>
    ) => {
      if (ws.readyState === WebSocket.OPEN) {
        ws.send(JSON.stringify(payload));
      }
    };

    const cleanup = () => {
      if (state === "CLOSED") return;

      state = "CLOSED";

      clearTimeout(authenticationTimeout);
      clearTimeout(sessionTimeout);

      realtimeSession?.close();
      realtimeSession = null;

      if (activeAttemptId) {
        activeAttempts.delete(activeAttemptId);
        activeAttemptId = null;
      }
    };

    const fail = (message: string) => {
      if (state === "CLOSED") return;

      console.error("[WS ERROR]", message);

      send({
        type: "error",
        message,
      });

      cleanup();

      if (ws.readyState === WebSocket.OPEN) {
        ws.close(1011, "Transcription failed");
      }
    };

    ws.on("message", async (data, isBinary) => {
      try {
        if (state === "CLOSED") return;

        /*
         * Binary PCM audio
         */

        if (isBinary) {
          if (
            state !== "STREAMING" ||
            !realtimeSession
          ) {
            return fail("Session is not ready");
          }

          const audio = Buffer.isBuffer(data)
            ? data
            : Array.isArray(data)
              ? Buffer.concat(data)
              : Buffer.from(data);

          // PCM16 samples must contain two bytes.
          if (audio.length % 2 !== 0) {
            return fail("Invalid PCM audio");
          }

          receivedBytes += audio.length;

          if (receivedBytes > maxAudioBytes) {
            return fail("Audio duration limit exceeded");
          }

          // Prevent sending audio substantially
          // faster than real time.
          const elapsedSeconds =
            (performance.now() - streamingStartedAt) / 1000;

          if (
            receivedBytes >
            (elapsedSeconds + 5) * 48000
          ) {
            return fail("Audio rate limit exceeded");
          }

          realtimeSession.appendAudio(audio);

          return;
        }

        /*
         * JSON control messages
         */

        const message = JSON.parse(data.toString());

        if (message.type === "start") {
          if (state !== "IDLE") {
            return fail("Session already initialized");
          }

          state = "AUTHENTICATING";

          const { token, attemptId } =
            startSchema.parse(message);

          const authRequest = new Request(
            `${frontendOrigin}/ws/transcription`,
            {
              headers: {
                Authorization: `Bearer ${token}`,
              },
            }
          );

          const requestState =
            await clerk.authenticateRequest(
              authRequest,
              {
                authorizedParties: [frontendOrigin],
                acceptsToken: "session_token",
              }
            );

          const auth = requestState.toAuth();

if (!auth || !auth.isAuthenticated || !auth.userId) {
  return fail("Unauthorized");
}

const user = await getUserByClerkId(
  auth.userId
);

          if (!user) {
            return fail("User not found");
          }

          /*
           * Validate attempt ownership and state
           */

          const validationStart = performance.now();

          const attempt = await prisma.attempt.findFirst({
            where: {
              id: attemptId,
              userId: user.id,
              status: "IN_PROGRESS",
              stage: "SPEAKING",
            },
            select: {
              id: true,
              topic: {
                select: {
                  speakingTime: true,
                },
              },
            },
          });

          // Connection may have closed during DB lookup.
          if (ws.readyState !== WebSocket.OPEN) {
            cleanup();
            return;
          }

          if (!attempt) {
            return fail("Invalid speaking attempt");
          }

          if (activeAttempts.has(attemptId)) {
            return fail(
              "Attempt already has an active session"
            );
          }

          activeAttempts.add(attemptId);
          activeAttemptId = attemptId;
          activeUserId = user.id;

          clearTimeout(authenticationTimeout);

          // speakingTime is assumed to be in seconds.
          const allowedSeconds =
            attempt.topic.speakingTime + 10;

          maxAudioBytes = allowedSeconds * 48000;

          sessionTimeout = setTimeout(() => {
            fail("Session duration exceeded");
          }, (allowedSeconds + 30) * 1000);

          console.log(
            "[PERF] WebSocket attempt validation:",
            (performance.now() - validationStart).toFixed(2),
            "ms"
          );

          state = "CONNECTING";

          realtimeSession = createRealtimeTranscription({
            onReady: () => {
              if (state === "CLOSED") return;

              state = "STREAMING";
              streamingStartedAt = performance.now();

              send({ type: "ready" });

              console.log("[WS] Transcription ready");
            },

            onDelta: (delta) => {
              send({
                type: "delta",
                delta,
              });
            },

            onCompleted: (transcript) => {
  if (state !== "FINALIZING") return;

  if (
    !activeAttemptId ||
    !activeUserId ||
    !speakingEndedAt
  ) {
    return fail("Invalid transcription session");
  }

  const finalTranscript = transcript.trim();

  if (!finalTranscript) {
    return fail("Empty transcript received");
  }

  console.log(
    "[PERF] Transcript finalization:",
    (performance.now() - commitStartedAt).toFixed(2),
    "ms"
  );

  // Store the server-generated transcript before
  // notifying the frontend.
  saveRealtimeTranscript(
    activeAttemptId,
    activeUserId,
    finalTranscript,
    speakingEndedAt
  );

  send({
    type: "completed",
    transcript: finalTranscript,
  });

  cleanup();

  ws.close(1000, "Transcription completed");
},

            onError: (error) => {
              fail(error.message);
            },
          });

          return;
        }

        /*
         * Finalize transcription
         */

        if (message.type === "commit") {
          if (
            state !== "STREAMING" ||
            !realtimeSession
          ) {
            return fail("Session is not ready");
          }

          // Minimum 100ms of PCM audio.
          if (receivedBytes < 4800) {
            return fail("Insufficient audio");
          }

          state = "FINALIZING";
          commitStartedAt = performance.now();
          speakingEndedAt = new Date();

          clearTimeout(sessionTimeout);

          sessionTimeout = setTimeout(() => {
            fail("Transcript finalization timed out");
          }, 30000);

          realtimeSession.commit();

          return;
        }

        if (message.type === "cancel") {
          cleanup();
          ws.close(1000, "Cancelled");
          return;
        }

        fail("Unsupported message type");

      } catch (error) {
        console.error("[WS] Processing error:", error);

        fail("Unable to process transcription request");
      }
    });

    ws.on("close", () => {
      cleanup();
      console.log("[WS] Client disconnected");
    });

    ws.on("error", (error) => {
      console.error("[WS] Connection error:", error);
      cleanup();
      ws.terminate();
    });
  });

  console.log("[WS] Transcription server initialized");

  return wss;
};
