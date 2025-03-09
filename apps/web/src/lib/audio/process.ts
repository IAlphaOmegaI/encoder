import type { FFmpeg } from "@ffmpeg/ffmpeg";
import { fetchFile } from "@ffmpeg/util";
import type { EncodecProcessor } from './encodec';

export const processAudio = async (
    ffmpeg: FFmpeg,
    file: File,
    encodecProcessor: EncodecProcessor
): Promise<{
    encoded: Float32Array;
    metadata: {
        sampleRate: number;
        duration: number;
    };
}> => {
    // First convert to 24kHz WAV using FFmpeg
    const unprocessed = await fetchFile(file);
    await ffmpeg.writeFile('input', unprocessed);

    await ffmpeg.exec([
        '-i', 'input',
        '-ar', '24000',  // EnCodec expects 24kHz
        '-ac', '1',      // mono
        '-c:a', 'pcm_f32le',
        '-y',
        'output.wav'
    ]);

    // Read the processed WAV
    const processed = await ffmpeg.readFile('output.wav');
    const audioBuffer = processed instanceof Uint8Array ? processed.buffer : new ArrayBuffer(0);

    // Convert to Float32Array
    const audioContext = new AudioContext({ sampleRate: 24000 });
    const audioData = await audioContext.decodeAudioData(audioBuffer);
    const channelData = audioData.getChannelData(0);

    // Encode using EnCodec ONNX model
    const encoded = await encodecProcessor.encode(channelData);

    return {
        encoded,
        metadata: {
            sampleRate: 24000,
            duration: channelData.length / 24000,
        }
    };
};