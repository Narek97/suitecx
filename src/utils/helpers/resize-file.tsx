import Resizer from 'react-image-file-resizer';

interface ResizeResult {
  file: File;
}
export const resizeFile = (file: File): Promise<ResizeResult> => {
  const fileSizeThreshold = 1024 * 1024;

  return new Promise((resolve, reject) => {
    if (file.size <= fileSizeThreshold) {
      resolve({ file });
    } else {
      Resizer.imageFileResizer(
        file,
        300,
        300,
        'PNG',
        100,
        0,
        uri => {
          try {
            const blob = dataURLtoBlob(uri as string);
            const newFile = new File([blob], file.name, { type: 'image/png' });
            resolve({ file: newFile });
          } catch (error) {
            reject(error);
          }
        },
        'base64',
      );
    }
  });
};

function dataURLtoBlob(dataURL: string): Blob {
  const byteString = atob(dataURL.split(',')[1]);
  const mimeString = dataURL.split(',')[0].split(':')[1].split(';')[0];
  const ab = new ArrayBuffer(byteString.length);
  const ia = new Uint8Array(ab);
  for (let i = 0; i < byteString.length; i++) {
    ia[i] = byteString.charCodeAt(i);
  }
  return new Blob([ab], { type: mimeString });
}
