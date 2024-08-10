export interface ImageProcessorOptions {
  maxFileSize?: number;
  maxWidth?: number;
  maxHeight?: number;
}

export interface ResizeOptions {
  width?: number;
  height?: number;
  maintainAspectRatio?: boolean;
}

export interface CropOptions {
  top: number;
  left: number;
  width: number;
  height: number;
}

export type UploadFunction = (blob: Blob, fileName: string) => Promise<string>;
