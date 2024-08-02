export class ImageProcessor {
  private selectedImage: HTMLImageElement | null = null;

  public async selectImage(): Promise<void> {
    const file = await this._selectImageFile();
    this.selectedImage = await this.loadImage(file);
  }

  public getImagePreview(): string | null {
    return this.selectedImage?.src || null;
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
}
