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
  private originalMimeType: string | null = null;
  private _isLoading = false;
  private maxFileSize: number | null = null;
  private maxWidth: number | null = null;
  private maxHeight: number | null = null;

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
          this.originalMimeType = file.type;
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
      return this.stepDownImage(img, width, height);
    }

    return img;
  }

  private stepDownImage(
    img: HTMLImageElement,
    targetWidth: number,
    targetHeight: number
  ): HTMLImageElement {
    let currentWidth = img.width;
    let currentHeight = img.height;
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');

    canvas.width = currentWidth;
    canvas.height = currentHeight;
    ctx?.drawImage(img, 0, 0, currentWidth, currentHeight);

    while (currentWidth > targetWidth || currentHeight > targetHeight) {
      const ratioWidth = currentWidth / targetWidth;
      const ratioHeight = currentHeight / targetHeight;
      const ratio = Math.max(ratioWidth, ratioHeight);

      if (ratio <= 2) {
        currentWidth = targetWidth;
        currentHeight = targetHeight;
      } else {
        currentWidth = Math.max(Math.floor(currentWidth / 2), targetWidth);
        currentHeight = Math.max(Math.floor(currentHeight / 2), targetHeight);
      }

      const tempCanvas = document.createElement('canvas');
      tempCanvas.width = currentWidth;
      tempCanvas.height = currentHeight;
      const tempCtx = tempCanvas.getContext('2d');

      tempCtx?.drawImage(canvas, 0, 0, currentWidth, currentHeight);

      canvas.width = currentWidth;
      canvas.height = currentHeight;
      ctx?.drawImage(tempCanvas, 0, 0);
    }

    const result = new Image();
    result.src = canvas.toDataURL(this.originalMimeType || 'image/jpeg');
    return result;
  }
}
