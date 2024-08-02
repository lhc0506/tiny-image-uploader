import './style.css';
import { ImageProcessor } from './ImageProcessor';

const imageProcessor = new ImageProcessor(5 * 1024 * 1024);
const selectButton = document.getElementById('selectImage') as HTMLButtonElement;
const previewImg = document.getElementById('imagePreview') as HTMLImageElement;
const resizeButton = document.getElementById('resize') as HTMLButtonElement;

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

resizeButton.addEventListener('click', () => {
  const resizedImage = imageProcessor.resizeImage(500, 500);
  if (resizedImage) {
    previewImg.src = resizedImage;
  }
});
