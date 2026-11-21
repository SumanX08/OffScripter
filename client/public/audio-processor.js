
class PCMProcessor extends AudioWorkletProcessor {
  constructor() {
    super();

    this.buffer = new Int16Array(2400);
    this.offset = 0;
    this.recording = true;

    this.port.onmessage = (event) => {
      if (event.data.type === "flush") {
        this.recording = false;

        if (this.offset > 0) {
          const remaining = this.buffer.slice(
            0,
            this.offset
          );

          this.port.postMessage(
            {
              type: "audio",
              buffer: remaining.buffer,
            },
            [remaining.buffer]
          );

          this.offset = 0;
        }

        this.port.postMessage({
          type: "flushed",
        });
      }
    };
  }

  process(inputs) {
    if (!this.recording) return true;

    const input = inputs[0];

    if (!input || !input[0]) {
      return true;
    }

    const samples = input[0];

    for (let i = 0; i < samples.length; i++) {
      const sample = Math.max(
        -1,
        Math.min(1, samples[i])
      );

      this.buffer[this.offset++] =
        sample < 0
          ? sample * 0x8000
          : sample * 0x7fff;

      if (this.offset === this.buffer.length) {
        const audio = this.buffer;

        this.port.postMessage(
          {
            type: "audio",
            buffer: audio.buffer,
          },
          [audio.buffer]
        );

        this.buffer = new Int16Array(2400);
        this.offset = 0;
      }
    }

    return true;
  }
}

registerProcessor("pcm-processor", PCMProcessor);
