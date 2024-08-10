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

interface CropOptions {
  top: number;
  left: number;
  width: number;
  height: number;
}

export class ImageProcessor {
  private originalImage: HTMLImageElement | null = null;
  private selectedImage: HTMLImageElement | null = null;
  private originalMimeType: string | null = null;
  private _isLoading = false;
  private maxFileSize: number | null = null;
  private maxWidth: number | null = null;
  private maxHeight: number | null = null;
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;

  constructor({ maxFileSize, maxWidth, maxHeight }: ImageProcessorOptions) {
    this.maxFileSize = maxFileSize || null;
    this.maxWidth = maxWidth || null;
    this.maxHeight = maxHeight || null;
    this.canvas = document.createElement('canvas');
    const ctx = this.canvas.getContext('2d');
    if (!ctx) {
      throw new Error('Canvas context is not supported');
    }
    this.ctx = ctx;
  }

  public async selectImage(): Promise<void> {
    try {
      this._isLoading = true;
      const file = await this._selectImageFile();
      if (this.isValidFileSize(file)) {
        this.selectedImage = await this.loadImage(file);
        this.originalImage = this.cloneImage(this.selectedImage);

        this.resetCanvas();
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
    this.resetCanvas();
    return resizedImg.src;
  }

  public cropImage({ top, left, width, height }: CropOptions): string {
    if (!this.selectedImage) {
      throw new Error('No image selected');
    }

    if (this._isLoading) {
      throw new Error('Image is still loading. Please wait.');
    }

    this.resetCanvas();

    const cropWidth = Math.min(width, this.selectedImage.width - left);
    const cropHeight = Math.min(height, this.selectedImage.height - top);

    const imageData = this.ctx.getImageData(left, top, cropWidth, cropHeight);

    this.canvas.width = cropWidth;
    this.canvas.height = cropHeight;
    this.ctx.putImageData(imageData, 0, 0);

    const croppedImage = new Image();
    croppedImage.src = this.canvas.toDataURL(this.originalMimeType || 'image/jpeg');

    this.selectedImage = croppedImage;

    this.resetCanvas();

    return croppedImage.src;
  }

  public restoreOriginalImage(): string | null {
    if (!this.originalImage) {
      console.warn('No original image available to restore');
      return null;
    }
    this.selectedImage = this.cloneImage(this.originalImage);
    this.resetCanvas();
    return this.selectedImage.src;
  }

  public hasOriginalImage(): boolean {
    return this.originalImage !== null;
  }

  private cloneImage(img: HTMLImageElement): HTMLImageElement {
    const clone = new Image();
    clone.src = img.src;
    return clone;
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

  private resetCanvas() {
    if (this.selectedImage) {
      this.canvas.width = this.selectedImage.width;
      this.canvas.height = this.selectedImage.height;
      this.ctx.drawImage(
        this.selectedImage,
        0,
        0,
        this.selectedImage.width,
        this.selectedImage.height
      );
    }
  }
}
