import { WINDOW_MIN_HEIGHT, WINDOW_MIN_WIDTH } from '#constants';
import type { HViewportOffset, VViewportOffset } from '#models';
import { useWindowSize } from '@vueuse/core';

/**
 *
 * @param x x position, in pixels, from the left of the viewport
 * @param elWidth width of element being positioned
 */
export function xToViewportOffset(x: number, elWidth: number): HViewportOffset {
  const viewportWidth = useWindowSize().width.value;

  const left = x;
  const center = x + elWidth / 2;
  const right = x + elWidth;

  if (center < viewportWidth * 0.5) {
    return {
      from: 'left',
      offsetRatio: Math.max(left / viewportWidth, 0),
    };
  } else {
    return {
      from: 'right',
      offsetRatio: Math.max((viewportWidth - right) / viewportWidth, 0),
    };
  }
}

export function viewportOffsetToX(hOffset: HViewportOffset, elWidth: number): number {
  const viewportWidth = useWindowSize().width.value;

  const offsetPixels = hOffset.offsetRatio * viewportWidth;
  switch (hOffset.from) {
    case 'left':
      return offsetPixels;
    case 'right':
      return viewportWidth - elWidth - offsetPixels;
  }
}

/**
 *
 * @param y y position, in pixels, from the top of the viewport
 * @param elHeight width of element being positioned
 */
export function yToViewportOffset(y: number, elHeight: number): VViewportOffset {
  const viewportHeight = useWindowSize().height.value;

  const top = y;
  const center = y + elHeight / 2;
  const bottom = y + elHeight;

  if (center < viewportHeight * 0.5) {
    return {
      from: 'top',
      offsetRatio: Math.max(top / viewportHeight, 0),
    };
  } else {
    return {
      from: 'bottom',
      offsetRatio: Math.max((viewportHeight - bottom) / viewportHeight, 0),
    };
  }
}

export function viewportOffsetToY(vOfset: VViewportOffset, elHeight: number): number {
  const viewportHeight = useWindowSize().height.value;

  const offsetPixels = vOfset.offsetRatio * viewportHeight;
  switch (vOfset.from) {
    case 'top':
      return offsetPixels;
    case 'bottom':
      return viewportHeight - elHeight - offsetPixels;
  }
}

export function clampWidth(targetWidth: number) {
  if (targetWidth < WINDOW_MIN_WIDTH) return WINDOW_MIN_WIDTH;

  const viewportWidth = useWindowSize().width.value;
  if (targetWidth > viewportWidth) return viewportWidth;

  return targetWidth;
}

export function clampHeight(targetHeight: number) {
  if (targetHeight < WINDOW_MIN_HEIGHT) return WINDOW_MIN_HEIGHT;

  const viewportHeight = useWindowSize().height.value;
  if (targetHeight > viewportHeight) return viewportHeight;

  return targetHeight;
}
