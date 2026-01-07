import { ProcessedImage, ProcessingOptions } from '../types';

// Helper to load image
const loadImage = (src: string): Promise<HTMLImageElement> => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = src;
  });
};

// Helper to check if a pixel is considered "black" based on sensitivity
const isBlack = (r: number, g: number, b: number, sensitivity: number): boolean => {
  return r <= sensitivity && g <= sensitivity && b <= sensitivity;
};

// Function to find crop bounds for non-black content
const getCropBounds = (
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  sensitivity: number
) => {
  const imageData = ctx.getImageData(0, 0, width, height);
  const data = imageData.data;
  
  let top = 0;
  let bottom = height;
  let left = 0;
  let right = width;

  // Scan from top
  for (let y = 0; y < height; y++) {
    let rowHasContent = false;
    for (let x = 0; x < width; x++) {
      const idx = (y * width + x) * 4;
      if (!isBlack(data[idx], data[idx + 1], data[idx + 2], sensitivity)) {
        rowHasContent = true;
        break;
      }
    }
    if (rowHasContent) {
      top = y;
      break;
    }
  }

  // Scan from bottom
  for (let y = height - 1; y >= 0; y--) {
    let rowHasContent = false;
    for (let x = 0; x < width; x++) {
      const idx = (y * width + x) * 4;
      if (!isBlack(data[idx], data[idx + 1], data[idx + 2], sensitivity)) {
        rowHasContent = true;
        break;
      }
    }
    if (rowHasContent) {
      bottom = y + 1;
      break;
    }
  }

  // Scan from left
  for (let x = 0; x < width; x++) {
    let colHasContent = false;
    for (let y = top; y < bottom; y++) {
      const idx = (y * width + x) * 4;
      if (!isBlack(data[idx], data[idx + 1], data[idx + 2], sensitivity)) {
        colHasContent = true;
        break;
      }
    }
    if (colHasContent) {
      left = x;
      break;
    }
  }

  // Scan from right
  for (let x = width - 1; x >= 0; x--) {
    let colHasContent = false;
    for (let y = top; y < bottom; y++) {
      const idx = (y * width + x) * 4;
      if (!isBlack(data[idx], data[idx + 1], data[idx + 2], sensitivity)) {
        colHasContent = true;
        break;
      }
    }
    if (colHasContent) {
      right = x + 1;
      break;
    }
  }

  // Safety check if image is fully black
  if (right <= left || bottom <= top) {
    return { top: 0, bottom: height, left: 0, right: width };
  }

  return { top, bottom, left, right };
};

export const sliceNineGrid = async (
  file: File,
  options: ProcessingOptions
): Promise<ProcessedImage[]> => {
  const imageUrl = URL.createObjectURL(file);
  const img = await loadImage(imageUrl);
  
  // Clean up object URL
  URL.revokeObjectURL(imageUrl);

  const totalWidth = img.naturalWidth;
  const totalHeight = img.naturalHeight;
  
  // Assume 3x3 grid
  const cellWidth = Math.floor(totalWidth / 3);
  const cellHeight = Math.floor(totalHeight / 3);
  
  const results: ProcessedImage[] = [];

  // Temporary canvas for processing each cell
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d', { willReadFrequently: true });

  if (!ctx) throw new Error("Could not get canvas context");

  for (let row = 0; row < 3; row++) {
    for (let col = 0; col < 3; col++) {
      // Step 1: Extract the rough cell
      canvas.width = cellWidth;
      canvas.height = cellHeight;
      
      ctx.clearRect(0, 0, cellWidth, cellHeight);
      ctx.drawImage(
        img,
        col * cellWidth, row * cellHeight, cellWidth, cellHeight, // Source
        0, 0, cellWidth, cellHeight // Destination
      );

      let finalCanvas = canvas;
      let finalWidth = cellWidth;
      let finalHeight = cellHeight;

      // Step 2: Auto-crop black borders if enabled
      if (options.removeBlackBorders) {
        const bounds = getCropBounds(ctx, cellWidth, cellHeight, options.sensitivity);
        const cropWidth = bounds.right - bounds.left;
        const cropHeight = bounds.bottom - bounds.top;

        // Create a new canvas for the cropped version
        const croppedCanvas = document.createElement('canvas');
        croppedCanvas.width = cropWidth;
        croppedCanvas.height = cropHeight;
        const croppedCtx = croppedCanvas.getContext('2d');
        
        if (croppedCtx) {
          croppedCtx.drawImage(
            canvas,
            bounds.left, bounds.top, cropWidth, cropHeight,
            0, 0, cropWidth, cropHeight
          );
          finalCanvas = croppedCanvas;
          finalWidth = cropWidth;
          finalHeight = cropHeight;
        }
      }

      // Step 3: Convert to Blob/DataURL
      const blob = await new Promise<Blob | null>((resolve) => finalCanvas.toBlob(resolve, 'image/jpeg', 0.95));
      if (!blob) continue;
      
      const url = URL.createObjectURL(blob);
      
      results.push({
        id: `slice-${row}-${col}-${Date.now()}`,
        index: row * 3 + col,
        originalUrl: url,
        blob: blob,
        width: finalWidth,
        height: finalHeight
      });
    }
  }

  return results;
};
