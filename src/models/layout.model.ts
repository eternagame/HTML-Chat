export interface WindowRect {
  x: number;
  y: number;
  width: number;
  height: number;
}
export type WindowState = 'normal' | 'minimized' | 'fullscreen';
export type WindowHandle = 'n' | 's' | 'e' | 'w' | 'ne' | 'nw' | 'se' | 'sw';

export type HAlign = 'left' | 'center' | 'right';
export type VAlign = 'top' | 'center' | 'bottom';

export interface HViewportOffset {
  from: Exclude<HAlign, 'center'>;
  offsetRatio: number;
}

export interface VViewportOffset {
  from: Exclude<VAlign, 'center'>;
  offsetRatio: number;
}
