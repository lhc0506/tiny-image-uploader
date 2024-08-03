export interface ImageProcessorOptions {
  maxFileSize?: number;
  maxWidth?: number;
  maxHeight?: number;
}

export class ImageProcessor {
  private selectedImage: HTMLImageElement | null = null;
  private maxFileSize: number | null = null;
  private maxWidth: number | null = null;
  private maxHeight: number | null = null;
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D | null = null;

  constructor({ maxFileSize, maxWidth, maxHeight }: ImageProcessorOptions) {
    if (maxFileSize) {
      this.maxFileSize = maxFileSize;
    }
    if (maxWidth) {
      this.maxWidth = maxWidth;
    }
    if (maxHeight) {
      this.maxHeight = maxHeight;
    }

    this.canvas = document.createElement('canvas');
    this.ctx = this.canvas.getContext('2d');
  }

  public async selectImage(): Promise<void> {
    const file = await this._selectImageFile();
    if (this.isValidFileSize(file)) {
      this.selectedImage = await this.loadImage(file);
    } else {
      throw new Error('File size exceeds the maximum limit');
    }
  }

  public getImagePreview(): string | null {
    return this.selectedImage?.src || null;
  }

  public resizeImage(width: number, height: number): string | null {
    if (!this.selectedImage) {
      return null;
    }

    const resizedImg = this.resizeImageIfNeeded(this.selectedImage, width, height);
    this.selectedImage = resizedImg;
    return resizedImg.src;
  }

  private _selectImageFile(): Promise<File> {
    return new Promise((resolve) => {
      const input = document.createElement('input');
      input.type = 'file';
      input.accept = 'image/*';
      input.onchange = (event: Event) => {
        const file = (event.target as HTMLInputElement).files?.[0];
        if (file) resolve(file);
      };
      input.click();
    });
  }

  private loadImage(file: File): Promise<HTMLImageElement> {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const img = new Image();
        img.onload = () => {
          const resizedImage = this.resizeImageIfNeeded(img);
          resolve(resizedImage);
        };

        img.src = e.target?.result as string;
      };
      reader.readAsDataURL(file);
    });
  }

  private isValidFileSize(file: File): boolean {
    return this.maxFileSize ? file.size <= this.maxFileSize : true;
  }

  private resizeImageIfNeeded(
    img: HTMLImageElement,
    targetWidth?: number,
    targetHeight?: number
  ): HTMLImageElement {
    let width = targetWidth || img.width;
    let height = targetHeight || img.height;
    const aspectRatio = img.width / img.height;

    if (targetWidth && targetHeight) {
      if (width / height > aspectRatio) {
        width = height * aspectRatio;
      } else {
        height = width / aspectRatio;
      }
    }

    if (this.maxWidth && width > this.maxWidth) {
      width = this.maxWidth;
      height = width / aspectRatio;
    }
    if (this.maxHeight && height > this.maxHeight) {
      height = this.maxHeight;
      width = height * aspectRatio;
    }

    if (width !== img.width || height !== img.height) {
      this.canvas.width = width;
      this.canvas.height = height;
      this.ctx?.drawImage(img, 0, 0, width, height);

      const resizedImg = new Image();
      resizedImg.src = this.canvas.toDataURL('image/jpeg');
      return resizedImg;
    }

    return img;
  }
}
