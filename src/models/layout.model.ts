export interface WindowRect {
  x: number;
  y: number;
  width: number;
  height: number;
}
export type WindowState = 'normal' | 'minimized' | 'fullscreen';
export type WindowHandle = 'n' | 's' | 'e' | 'w' | 'ne' | 'nw' | 'se' | 'sw';
