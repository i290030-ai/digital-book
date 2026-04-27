export type ImageLayout = 'top' | 'bottom' | 'right' | 'left' | 'background';

export interface Chapter {
  id: number;
  title: string;
  subtitle?: string;
  body: string;
  image?: string;       // legacy — kept for compatibility
  images?: string[];    // preferred: array of image paths
  imageAlt?: string;
  imageCaption?: string;
}
