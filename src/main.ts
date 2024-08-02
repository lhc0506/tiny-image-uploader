import './style.css';
import { ImageProcessor } from './ImageProcessor';

const imageProcessor = new ImageProcessor(1);
const selectButton = document.getElementById('selectImage') as HTMLButtonElement;
const previewImg = document.getElementById('imagePreview') as HTMLImageElement;

selectButton.addEventListener('click', async () => {
  try {
    await imageProcessor.selectImage();
    const previewSrc = imageProcessor.getImagePreview();

    if (!previewSrc) {
      return;
    }

    previewImg.src = previewSrc;
  } catch (error) {
    console.error('Error selecting image:', error);
  }
});
