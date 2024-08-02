export class ImageProcessor {
  private selectedImage: HTMLImageElement | null = null;
  private maxFileSize: number | null = null;
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D | null = null;

  constructor(maxFileSize?: number) {
    if (maxFileSize) {
      this.maxFileSize = maxFileSize;
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

    this.canvas.width = width;
    this.canvas.height = height;
    this.ctx?.drawImage(this.selectedImage, 0, 0, width, height);
    return this.canvas.toDataURL('image/jpeg');
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
        img.onload = () => resolve(img);
        img.src = e.target?.result as string;
      };
      reader.readAsDataURL(file);
    });
  }

  private isValidFileSize(file: File): boolean {
    return this.maxFileSize ? file.size <= this.maxFileSize : true;
  }
}
