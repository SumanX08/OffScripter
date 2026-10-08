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
  try {
    console.log(
      "Transcribing audio:",
      {
        path: file.path,
        originalName: file.originalname,
        mimetype: file.mimetype,
        size: file.size,
      }
    );

    const audioFile = await toFile(
      createReadStream(file.path),
      file.originalname,
      {
        type: file.mimetype,
      }
    );

    const transcription =
      await openai.audio.transcriptions.create({
        file: audioFile,
        model: "gpt-4o-mini-transcribe",
      });

    console.log(
      "Transcription successful"
    );

    return transcription.text;
  } finally {
    try {
      await unlink(file.path);

      console.log(
        "Temporary audio file deleted"
      );
    } catch (error) {
      console.error(
        "Failed to delete temporary audio file:",
        error
      );
    }
  }
};