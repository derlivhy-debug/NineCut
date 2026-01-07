export interface ProcessedImage {
  id: string;
  originalUrl: string; // The full data URL
  blob: Blob;
  width: number;
  height: number;
  index: number; // 0-8
}

export interface ProcessingOptions {
  removeBlackBorders: boolean;
  sensitivity: number; // 0-255, threshold for "black"
}

export enum AppStatus {
  IDLE = 'IDLE',
  PROCESSING = 'PROCESSING',
  READY = 'READY',
  ERROR = 'ERROR'
}
