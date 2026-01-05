
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

    // Use a reliable CDN and fetch all components as Blob URLs to bypass cross-origin restrictions
    const baseURL = 'https://unpkg.com/@ffmpeg/core@0.12.6/dist/esm';
    
    try {
      await this.ffmpeg.load({
        coreURL: await toBlobURL(`${baseURL}/ffmpeg-core.js`, 'text/javascript'),
        wasmURL: await toBlobURL(`${baseURL}/ffmpeg-core.wasm`, 'application/wasm'),
        // Explicitly providing the worker URL as a blob prevents the origin mismatch error
        workerURL: await toBlobURL(`${baseURL}/ffmpeg-core.worker.js`, 'text/javascript'),
      });
      this.isLoaded = true;
    } catch (error) {
      console.error('FFmpeg Load Error:', error);
      throw error;
    }
  }

  public async convert(
    file: File, 
    options: ConversionOptions,
    onProgress: (progress: number) => void
  ): Promise<{ url: string; name: string }> {
    if (!this.isLoaded) await this.load();

    const inputName = 'input_' + file.name;
    const outputName = file.name.replace(/\.[^/.]+$/, "") + ".mp3";

    const progressHandler = ({ progress }: { progress: number }) => {
      onProgress(progress);
    };

    this.ffmpeg.on('progress', progressHandler);

    try {
      await this.ffmpeg.writeFile(inputName, await fetchFile(file));

      const command = [
        '-i', inputName,
        '-ar', options.sampleRate,
        '-ac', '2',
        '-b:a', options.bitrate,
        outputName
      ];

      await this.ffmpeg.exec(command);

      const data = await this.ffmpeg.readFile(outputName);
      const url = URL.createObjectURL(new Blob([(data as any).buffer], { type: 'audio/mp3' }));

      await this.ffmpeg.deleteFile(inputName);
      await this.ffmpeg.deleteFile(outputName);

      return { url, name: outputName };
    } catch (error) {
      console.error('Error during conversion:', error);
      throw error;
    } finally {
      this.ffmpeg.off('progress', progressHandler);
    }
  }
}
