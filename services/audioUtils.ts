/**
 * Decodes a base64 string into a Uint8Array.
 */
export function decode(base64: string): Uint8Array {
  const binaryString = atob(base64);
  const len = binaryString.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes;
}

/**
 * Decodes raw PCM data into an AudioBuffer.
 */
export async function decodeAudioData(
  data: Uint8Array,
  ctx: AudioContext,
  sampleRate: number,
  numChannels: number,
): Promise<AudioBuffer> {
  const dataInt16 = new Int16Array(data.buffer);
  const frameCount = dataInt16.length / numChannels;
  const buffer = ctx.createBuffer(numChannels, frameCount, sampleRate);

  for (let channel = 0; channel < numChannels; channel++) {
    const channelData = buffer.getChannelData(channel);
    for (let i = 0; i < frameCount; i++) {
      channelData[i] = dataInt16[i * numChannels + channel] / 32768.0;
    }
  }
  return buffer;
}

/**
 * Plays PCM audio and returns a stop function.
 * Tracks progress via requestAnimationFrame.
 */
export async function playPcmAudio(
  base64Audio: string,
  onProgress?: (percentage: number) => void,
  onEnded?: () => void
): Promise<() => void> {
  try {
    const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
    const audioContext = new AudioContextClass({ sampleRate: 24000 });
    const audioBuffer = await decodeAudioData(
      decode(base64Audio),
      audioContext,
      24000,
      1
    );
    
    const source = audioContext.createBufferSource();
    source.buffer = audioBuffer;
    source.connect(audioContext.destination);
    source.start();

    const startTime = audioContext.currentTime;
    const duration = audioBuffer.duration;
    let animationFrameId: number;

    const tick = () => {
      const elapsed = audioContext.currentTime - startTime;
      if (elapsed >= duration) {
        if (onProgress) onProgress(1); // 100%
        return;
      }
      
      if (onProgress) {
        onProgress(elapsed / duration);
      }
      animationFrameId = requestAnimationFrame(tick);
    };

    tick();

    source.onended = () => {
      cancelAnimationFrame(animationFrameId);
      if (onEnded) onEnded();
      // Cleanup context
      if (audioContext.state !== 'closed') {
        audioContext.close();
      }
    };

    // Return a stop function
    return () => {
      try {
        cancelAnimationFrame(animationFrameId);
        source.stop();
        if (audioContext.state !== 'closed') {
          audioContext.close();
        }
      } catch (e) {
        // Ignore errors if already stopped
      }
    };

  } catch (error) {
    console.error("Error playing audio:", error);
    if (onEnded) onEnded();
    return () => {};
  }
}