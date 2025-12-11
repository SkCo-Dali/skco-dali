/**
 * Utility for compressing images before email attachment
 * Reduces file size significantly while maintaining acceptable quality
 */

const MAX_DIMENSION = 1024; // Maximum width/height in pixels
const JPEG_QUALITY = 0.75; // 75% quality - good balance between size and quality
const MAX_FILE_SIZE_KB = 200; // Target max file size in KB

interface CompressionResult {
  file: File;
  originalSize: number;
  compressedSize: number;
  compressionRatio: number;
  wasCompressed: boolean;
}

/**
 * Compresses an image file by resizing and reducing quality
 * @param file - The original image file
 * @returns Promise with compressed file and compression stats
 */
export async function compressImage(file: File): Promise<CompressionResult> {
  const originalSize = file.size;
  
  // Only compress image files
  if (!file.type.startsWith('image/')) {
    return {
      file,
      originalSize,
      compressedSize: originalSize,
      compressionRatio: 1,
      wasCompressed: false,
    };
  }

  // Skip if already small enough (< 100KB)
  if (file.size < 100 * 1024) {
    console.log(`📷 Image already small (${(file.size / 1024).toFixed(1)}KB), skipping compression`);
    return {
      file,
      originalSize,
      compressedSize: originalSize,
      compressionRatio: 1,
      wasCompressed: false,
    };
  }

  try {
    const image = await loadImage(file);
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');

    if (!ctx) {
      throw new Error('Could not get canvas context');
    }

    // Calculate new dimensions maintaining aspect ratio
    let { width, height } = calculateDimensions(image.naturalWidth, image.naturalHeight);

    canvas.width = width;
    canvas.height = height;

    // Use better image smoothing for quality
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = 'high';

    // Draw resized image
    ctx.drawImage(image, 0, 0, width, height);

    // Convert to JPEG blob with compression
    const compressedBlob = await canvasToBlob(canvas, 'image/jpeg', JPEG_QUALITY);

    // If still too large, try more aggressive compression
    let finalBlob = compressedBlob;
    if (compressedBlob.size > MAX_FILE_SIZE_KB * 1024) {
      console.log(`📷 Still large (${(compressedBlob.size / 1024).toFixed(1)}KB), applying more compression...`);
      finalBlob = await canvasToBlob(canvas, 'image/jpeg', 0.6); // More aggressive
    }

    // Create new File object with compressed data
    const compressedFileName = file.name.replace(/\.[^.]+$/, '.jpg');
    const compressedFile = new File([finalBlob], compressedFileName, {
      type: 'image/jpeg',
      lastModified: Date.now(),
    });

    const compressionRatio = originalSize / compressedFile.size;

    console.log(`📷 Image compressed: ${(originalSize / 1024).toFixed(1)}KB → ${(compressedFile.size / 1024).toFixed(1)}KB (${compressionRatio.toFixed(1)}x reduction)`);

    return {
      file: compressedFile,
      originalSize,
      compressedSize: compressedFile.size,
      compressionRatio,
      wasCompressed: true,
    };
  } catch (error) {
    console.error('📷 Image compression failed:', error);
    // Return original file if compression fails
    return {
      file,
      originalSize,
      compressedSize: originalSize,
      compressionRatio: 1,
      wasCompressed: false,
    };
  }
}

/**
 * Compresses multiple image files
 */
export async function compressImages(files: File[]): Promise<{ files: File[]; stats: CompressionResult[] }> {
  const results = await Promise.all(files.map(compressImage));
  
  const totalOriginal = results.reduce((sum, r) => sum + r.originalSize, 0);
  const totalCompressed = results.reduce((sum, r) => sum + r.compressedSize, 0);
  
  if (totalOriginal > totalCompressed) {
    console.log(`📷 Total compression: ${(totalOriginal / 1024).toFixed(1)}KB → ${(totalCompressed / 1024).toFixed(1)}KB (${((1 - totalCompressed / totalOriginal) * 100).toFixed(0)}% saved)`);
  }

  return {
    files: results.map(r => r.file),
    stats: results,
  };
}

/**
 * Calculate new dimensions maintaining aspect ratio
 */
function calculateDimensions(width: number, height: number): { width: number; height: number } {
  if (width <= MAX_DIMENSION && height <= MAX_DIMENSION) {
    return { width, height };
  }

  if (width > height) {
    return {
      width: MAX_DIMENSION,
      height: Math.round((height * MAX_DIMENSION) / width),
    };
  } else {
    return {
      width: Math.round((width * MAX_DIMENSION) / height),
      height: MAX_DIMENSION,
    };
  }
}

/**
 * Load an image file into an HTMLImageElement
 */
function loadImage(file: File): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      URL.revokeObjectURL(img.src); // Clean up
      resolve(img);
    };
    img.onerror = () => reject(new Error('Failed to load image'));
    img.src = URL.createObjectURL(file);
  });
}

/**
 * Convert canvas to Blob
 */
function canvasToBlob(canvas: HTMLCanvasElement, type: string, quality: number): Promise<Blob> {
  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (blob) {
          resolve(blob);
        } else {
          reject(new Error('Failed to create blob'));
        }
      },
      type,
      quality
    );
  });
}

/**
 * Format file size for display
 */
export function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}
