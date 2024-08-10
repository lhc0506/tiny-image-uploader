# tiny-image-uploader

 > tiny-image-uploader is a TypeScript library that allows easy selection, cropping, and resizing of images in web applications. It also includes file size limitation features for efficient image management.


- [tiny-image-uploader](#tiny-image-uploader)
  - [Demo](#demo)
  - [Features](#features)
  - [Installation](#installation)
  - [Usage](#usage)
    - [Example](#example)
  - [Options](#options)
  - [Methods and Types](#methods-and-types)
    - [Constructor](#constructor)
    - [selectImage()](#selectimage)
    - [resizeImage(options)](#resizeimageoptions)
    - [cropImage(options)](#cropimageoptions)
    - [uploadImage(uploadFunction)](#uploadimageuploadfunction)
    - [restoreOriginalImage()](#restoreoriginalimage)
  - [License](#license)

## Demo

_[Add a link to your demo here if available]_

## Features

- Select images from local device
- Resize images with customizable options
- Crop images with specified dimensions
- Upload processed images using custom upload functions
- Restore original image
- Lightweight and dependency-free core

## Installation

```sh
npm install image-processor
```

## Usage

### Example

```typescript
import { ImageProcessor, ImageProcessorOptions, ResizeOptions, CropOptions, UploadFunction } from 'image-processor';

// Initialize ImageProcessor
const options: ImageProcessorOptions = {
  maxFileSize: 5 * 1024 * 1024, // 5MB
  maxWidth: 1920,
  maxHeight: 1080
};
const imageProcessor = new ImageProcessor(options);

// Define resize options
const resizeOptions: ResizeOptions = {
  width: 800,
  height: 600,
  maintainAspectRatio: true
};

// Define crop options
const cropOptions: CropOptions = {
  top: 0,
  left: 0,
  width: 400,
  height: 300
};

// Define upload function
const uploadFunction: UploadFunction = async (blob, fileName) => {
  const formData = new FormData();
  formData.append('file', blob, fileName);
  const response = await fetch('https://your-upload-url.com', {
    method: 'POST',
    body: formData
  });
  const data = await response.json();
  return data.url;
};

// Process and upload image
async function processAndUploadImage() {
  try {
    await imageProcessor.selectImage();
    const resizedImageSrc = await imageProcessor.resizeImage(resizeOptions);
    console.log('Resized image:', resizedImageSrc);

    const croppedImageSrc = imageProcessor.cropImage(cropOptions);
    console.log('Cropped image:', croppedImageSrc);

    const uploadedUrl = await imageProcessor.uploadImage(uploadFunction);
    console.log('Uploaded image URL:', uploadedUrl);

    const originalImageSrc = imageProcessor.restoreOriginalImage();
    console.log('Restored original image:', originalImageSrc);
  } catch (error) {
    console.error('Error processing image:', error);
  }
}

processAndUploadImage();
```

## Options

You can pass these options to `ImageProcessor` constructor:

- `maxFileSize`: The maximum file size (in bytes) allowed for image selection.
- `maxWidth`: The maximum width allowed for images.
- `maxHeight`: The maximum height allowed for images.

## Methods and Types

### Constructor

Create a new instance of ImageProcessor.

```typescript
interface ImageProcessorOptions {
  maxFileSize?: number;
  maxWidth?: number;
  maxHeight?: number;
}

const imageProcessor = new ImageProcessor(options: ImageProcessorOptions);
```

### selectImage()

Select an image file from the local device.

```typescript
await imageProcessor.selectImage(): Promise<void>;
```

### resizeImage(options)

Resize the selected image.

```typescript
interface ResizeOptions {
  width?: number;
  height?: number;
  maintainAspectRatio?: boolean;
}

const resizedImageSrc: string = await imageProcessor.resizeImage(options: ResizeOptions): Promise<string>;
```

### cropImage(options)

Crop the selected image.

```typescript
interface CropOptions {
  top: number;
  left: number;
  width: number;
  height: number;
}

const croppedImageSrc: string = imageProcessor.cropImage(options: CropOptions): string;
```

### uploadImage(uploadFunction)

Upload the processed image using a custom upload function.

```typescript
type UploadFunction = (blob: Blob, fileName: string) => Promise<string>;

const uploadedUrl: string = await imageProcessor.uploadImage(uploadFunction: UploadFunction): Promise<string>;
```

### restoreOriginalImage()

Restore the image to its original state.

```typescript
const originalImageSrc: string = imageProcessor.restoreOriginalImage(): string;
```

## License

[MIT License](LICENSE)
