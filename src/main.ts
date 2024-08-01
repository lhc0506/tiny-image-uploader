import './style.css'
import { ImageProcessor } from './ImageProcessor';

const imageProcessor = new ImageProcessor();
const selectButton = document.getElementById('selectImage') as HTMLButtonElement;
const previewDiv = document.getElementById('imagePreview') as HTMLDivElement;

selectButton.addEventListener('click', async () => {
  try {
    const file = await imageProcessor.selectImage();

    const img = document.createElement('img');
    img.src = URL.createObjectURL(file);
    img.style.maxWidth = '300px';
    previewDiv.innerHTML = '';
    previewDiv.appendChild(img);
  } catch (error) {
    console.error('Error selecting image:', error);
  }
});


