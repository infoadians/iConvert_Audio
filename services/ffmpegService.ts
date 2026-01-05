
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

    // jsdelivr is highly reliable for COEP/COOP environments
    const baseURL = 'https://cdn.jsdelivr.net/npm/@ffmpeg/core@0.12.6/dist/esm';
    
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
    } catch (error) {
      console.error('Detailed FFmpeg Load Error:', error);
      throw new Error('Audio engine initialization failed. This is often due to network restrictions or an incompatible browser environment.');
    }
  }

  public async convert(
    file: File, 
    options: ConversionOptions,
    onProgress: (progress: number) => void
  ): Promise<{ url: string; name: string }> {
    if (!this.isLoaded) await this.load();

    const inputName = 'input_' + file.name.replace(/\s+/g, '_');
    const outputName = file.name.replace(/\.[^/.]+$/, "").replace(/\s+/g, '_') + ".mp3";

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
      const blob = new Blob([(data as any).buffer], { type: 'audio/mp3' });
      const url = URL.createObjectURL(blob);

      // Clean up virtual file system
      try {
        await this.ffmpeg.deleteFile(inputName);
        await this.ffmpeg.deleteFile(outputName);
      } catch (e) {
        console.warn('FS cleanup warning:', e);
      }

      return { url, name: outputName };
    } catch (error) {
      console.error('Error during conversion:', error);
      throw error;
    } finally {
      this.ffmpeg.off('progress', progressHandler);
    }
  }
}
