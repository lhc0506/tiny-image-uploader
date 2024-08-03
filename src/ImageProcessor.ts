export interface ImageProcessorOptions {
  maxFileSize?: number;
  maxWidth?: number;
  maxHeight?: number;
}

interface ResizeOptions {
  width?: number;
  height?: number;
  maintainAspectRatio?: boolean;
}

export class ImageProcessor {
  private selectedImage: HTMLImageElement | null = null;
  private _isLoading = false;
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
    try {
      this._isLoading = true;
      const file = await this._selectImageFile();
      if (this.isValidFileSize(file)) {
        this.selectedImage = await this.loadImage(file);
      } else {
        throw new Error('File size exceeds the maximum limit');
      }
    } finally {
      this._isLoading = false;
    }
  }

  public getImagePreview() {
    return this.selectedImage?.src || null;
  }

  public resizeImage({ width, height, maintainAspectRatio = false }: ResizeOptions) {
    if (!this.selectedImage) {
      return null;
    }

    if (this._isLoading) {
      console.warn('Image is still loading. Please wait.');
      return null;
    }

    if (width === undefined && height === undefined) {
      throw new Error('At least one of width or height must be provided');
    }

    const currentWidth = this.selectedImage.width;
    const currentHeight = this.selectedImage.height;
    const targetWidth = width !== undefined ? width : currentWidth;
    const targetHeight = height !== undefined ? height : currentHeight;

    const resizedImg = this.resizeImageIfNeeded(this.selectedImage, {
      width: targetWidth,
      height: targetHeight,
      maintainAspectRatio,
    });

    this.selectedImage = resizedImg;
    return resizedImg.src;
  }

  get isLoading(): boolean {
    return this._isLoading;
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
          const resizedImage = this.resizeImageIfNeeded(img, { maintainAspectRatio: true });
          resolve(resizedImage);
        };

        img.src = e.target?.result as string;
      };
      reader.readAsDataURL(file);
    });
  }

  private isValidFileSize(file: File) {
    return this.maxFileSize ? file.size <= this.maxFileSize : true;
  }

  private resizeImageIfNeeded(img: HTMLImageElement, options: ResizeOptions) {
    const { width: targetWidth, height: targetHeight, maintainAspectRatio = false } = options;
    let width = targetWidth || img.width;
    let height = targetHeight || img.height;
    const aspectRatio = img.width / img.height;

    if (maintainAspectRatio) {
      if (targetWidth && targetHeight) {
        const ratio = Math.min(targetWidth / img.width, targetHeight / img.height);
        width = img.width * ratio;
        height = img.height * ratio;
      } else if (targetWidth) {
        height = targetWidth / aspectRatio;
      } else if (targetHeight) {
        width = targetHeight * aspectRatio;
      }
    }

    if (this.maxWidth && width > this.maxWidth) {
      width = this.maxWidth;
      height = maintainAspectRatio ? width / aspectRatio : height;
    }
    if (this.maxHeight && height > this.maxHeight) {
      height = this.maxHeight;
      width = maintainAspectRatio ? height * aspectRatio : width;
    }

    if (Math.abs(width - img.width) > 1 || Math.abs(height - img.height) > 1) {
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
