function hexToRgb(hex: string): number[] {
  hex = hex.replace(/^#/, '');
  const bigint = parseInt(hex, 16);
  const r = (bigint >> 16) & 255;
  const g = (bigint >> 8) & 255;
  const b = bigint & 255;
  return [r, g, b];
}

function rgbToHex(rgb: number[]): string {
  const [r, g, b] = rgb;
  return `#${((1 << 24) | (r << 16) | (g << 8) | b).toString(16).slice(1).toUpperCase()}`;
}

export const getComplementaryHexColor = (hex: string): string => {
  const rgb = hexToRgb(hex);
  const complementaryR = 255 - rgb[0];
  const complementaryG = 255 - rgb[1];
  const complementaryB = 255 - rgb[2];
  const complementaryRgb = [complementaryR, complementaryG, complementaryB];
  return rgbToHex(complementaryRgb);
};

export const getTextColorBasedOnBackground = (hexColor: string): string => {
  // Remove the '#' character, if it's present
  hexColor = hexColor.replace('#', '');

  // Convert the hexadecimal color to an RGB array
  const r = parseInt(hexColor.slice(0, 2), 16);
  const g = parseInt(hexColor.slice(2, 4), 16);
  const b = parseInt(hexColor.slice(4, 6), 16);

  // Calculate the relative luminance (perceived brightness) of the background color
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;

  // Choose text color based on luminance
  if (luminance > 0.5) {
    return '#545e6b'; // Use black text on light backgrounds
  } else {
    return '#ffffff'; // Use white text on dark backgrounds
  }
};
