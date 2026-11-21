
import OpenAI, { toFile } from "openai";
import { createReadStream } from "fs";
import { unlink } from "fs/promises";

import { env } from "../config/env.js";

const openai = new OpenAI({
  apiKey: env.OPENAI_API_KEY,
});

export const transcribeAudio = async (
  file: Express.Multer.File
) => {
  const totalStart = performance.now();

  try {
    console.log("Transcribing audio:", {
      originalName: file.originalname,
      mimetype: file.mimetype,
      size: file.size,
    });

    // 1. Prepare audio file
    const fileStart = performance.now();

    const audioFile = await toFile(
      createReadStream(file.path),
      file.originalname,
      {
        type: file.mimetype,
      }
    );

    console.log(
      "[PERF] Audio file preparation:",
      (performance.now() - fileStart).toFixed(2),
      "ms"
    );

    // 2. OpenAI transcription
    const transcriptionStart = performance.now();

    const transcription =
      await openai.audio.transcriptions.create({
        file: audioFile,
        model: "gpt-4o-mini-transcribe",
      });

    console.log(
      "[PERF] OpenAI transcription:",
      (performance.now() - transcriptionStart).toFixed(2),
      "ms"
    );

    const transcript = transcription.text;

    // 3. Audio and transcript metrics
    console.log("[AUDIO METRICS]", {
      audioSizeMB: (
        file.size / (1024 * 1024)
      ).toFixed(2),

      transcriptWords: transcript.trim()
        ? transcript.trim().split(/\s+/).length
        : 0,

      transcriptCharacters: transcript.length,
    });

    console.log("Transcription successful");

    return transcript;

  } finally {
    // 4. Clean up temporary file
    const cleanupStart = performance.now();

    try {
      await unlink(file.path);

      console.log(
        "[PERF] Temporary file cleanup:",
        (performance.now() - cleanupStart).toFixed(2),
        "ms"
      );
    } catch (error) {
      console.error(
        "Failed to delete temporary audio file:",
        error
      );
    }

    console.log(
      "[PERF] Transcription service total:",
      (performance.now() - totalStart).toFixed(2),
      "ms"
    );
  }
};
