
import { FFmpeg } from '@ffmpeg/ffmpeg';
import { toBlobURL, fetchFile } from '@ffmpeg/util';
import { ConversionOptions } from '../types';

export class FFmpegManager {
  private static instance: FFmpegManager;
  private ffmpeg: FFmpeg;
  private isLoaded: boolean = false;

  private constructor() {
    this.ffmpeg = new FFmpeg();
  }

  public static getInstance(): FFmpegManager {
    if (!FFmpegManager.instance) {
      FFmpegManager.instance = new FFmpegManager();
    }
    return FFmpegManager.instance;
  }

  public async load(): Promise<void> {
    if (this.isLoaded) return;

    // Use 0.12.4 core which is the stable pair for 0.12.7 lib
    const baseURL = 'https://cdn.jsdelivr.net/npm/@ffmpeg/core@0.12.4/dist/esm';

    try {
      // We load assets in parallel to improve startup speed
      const [coreURL, wasmURL, workerURL] = await Promise.all([
        toBlobURL(`${baseURL}/ffmpeg-core.js`, 'text/javascript'),
        toBlobURL(`${baseURL}/ffmpeg-core.wasm`, 'application/wasm'),
        toBlobURL(`${baseURL}/ffmpeg-core.worker.js`, 'text/javascript')
      ]);

      await this.ffmpeg.load({
        coreURL,
        wasmURL,
        workerURL,
      });

      this.isLoaded = true;
    } catch (error: any) {
      console.error('Detailed FFmpeg Load Error:', error);
      const cause = error?.message || String(error);
      const isolated = (self as any).crossOriginIsolated;
      throw new Error(
        `Audio engine failed to load (crossOriginIsolated=${isolated}). ${cause}`
      );
    }
  }

  public async convert(
    file: File,
    options: ConversionOptions,
    onProgress: (progress: number) => void
  ): Promise<{ url: string; name: string; size: number }> {
    if (!this.isLoaded) await this.load();

    // Sanitize input name to be safe for ffmpeg virtual fs
    const safeName = file.name.replace(/[^a-zA-Z0-9.]/g, '_');
    const inputName = 'input_' + safeName;
    const outputName = safeName.replace(/\.[^/.]+$/, "") + ".opus";

    const progressHandler = ({ progress }: { progress: number }) => {
      onProgress(progress);
    };

    this.ffmpeg.on('progress', progressHandler);

    try {
      await this.ffmpeg.writeFile(inputName, await fetchFile(file));

      const command = [
        '-i', inputName,
        '-c:a', 'libopus',
        '-b:a', options.bitrate,
        '-ac', '1',
        '-ar', '48000',
        '-vbr', 'on',
        '-compression_level', '10',
        outputName
      ];

      await this.ffmpeg.exec(command);

      const data = await this.ffmpeg.readFile(outputName);
      const blob = new Blob([(data as any).buffer], { type: 'audio/ogg; codecs=opus' });
      const url = URL.createObjectURL(blob);

      // Clean up virtual file system
      try {
        await this.ffmpeg.deleteFile(inputName);
        await this.ffmpeg.deleteFile(outputName);
      } catch (e) {
        console.warn('FS cleanup warning:', e);
      }

      return { url, name: outputName, size: blob.size };
    } catch (error) {
      console.error('Error during conversion:', error);
      throw error;
    } finally {
      this.ffmpeg.off('progress', progressHandler);
    }
  }
}
