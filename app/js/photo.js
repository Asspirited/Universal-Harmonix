// Universal Harmonix — Photo processing
// Browser only: requires FileReader, Image, Canvas.

export const MAX_PHOTOS    = 1;
const MAX_DIMENSION = 800;
const JPEG_QUALITY  = 0.7;

export function resizeToBase64(file) {
  return new Promise(resolve => {
    const reader = new FileReader();
    reader.onload = ev => {
      const image = new Image();
      image.onload = () => {
        let { width, height } = image;
        if (width > MAX_DIMENSION || height > MAX_DIMENSION) {
          if (width > height) { height = Math.round(height * MAX_DIMENSION / width); width = MAX_DIMENSION; }
          else                { width  = Math.round(width  * MAX_DIMENSION / height); height = MAX_DIMENSION; }
        }
        const canvas = document.createElement('canvas');
        canvas.width = width; canvas.height = height;
        canvas.getContext('2d').drawImage(image, 0, 0, width, height);
        resolve(canvas.toDataURL('image/jpeg', JPEG_QUALITY));
      };
      image.src = ev.target.result;
    };
    reader.readAsDataURL(file);
  });
}
