import type { MdFormat } from '#models';
import log from 'loglevel';

type Range = [start: number, end: number];

interface ToggleMdFormatInput {
  text: string;
  selectionRange: Range;
  format: MdFormat;
}

interface ToggleMDFormatResult {
  text: string;
  selectionRange: Range;
}

function getFormatCharacters(format: MdFormat): [prefix: string, suffix: string] {
  switch (format) {
    case 'Bold':
      return ['**', '**'];
    case 'Underline':
      return ['_', '_'];
    case 'Italics':
      return ['*', '*'];
    case 'Strikethrough':
      return ['~~', '~~'];
    case 'Blockquote':
      return ['> ', ''];
    case 'Code':
      return ['`', '`'];
    case 'Link':
      return ['[', ']()'];
    case 'Highlight':
      return ['|', '|'];
    default:
      log.warn('Unhandled format:', format);
      return ['', ''];
  }
}

/**
 * Selects current word if there's no text selected
 */
function getTargetRange(text: string, [start, end]: Range): Range {
  if (start !== end) {
    return [start, end];
  }
  const left = text.slice(0, start).match(/([^\s*~_`|]+)$/);
  const right = text.slice(start).match(/^([^\s*~_`|]+)/);
  return [left ? start - left[0].length : start, right ? start + right[0].length : start];
}

export function toggleMDFormat({
  text,
  selectionRange,
  format,
}: ToggleMdFormatInput): ToggleMDFormatResult {
  const [prefix, suffix] = getFormatCharacters(format);
  const isSelected = selectionRange[0] !== selectionRange[1];
  const [start, end] = getTargetRange(text, selectionRange);

  const before = text.substring(0, start);
  const targetText = text.substring(start, end);
  const after = text.substring(end);

  const hasPrefix = prefix && before.endsWith(prefix);
  if (hasPrefix) {
    // Remove format
    const hasSuffix = suffix && after.startsWith(suffix);
    const newText =
      before.slice(0, -prefix.length) + targetText + after.slice(hasSuffix ? suffix.length : 0);

    const newStart = (isSelected ? start : selectionRange[0]) - prefix.length;
    const newEnd = (isSelected ? end : selectionRange[0]) - prefix.length;
    return {
      text: newText,
      selectionRange: [newStart, newEnd],
    };
  } else {
    // Add format
    const newStart = (isSelected ? start : selectionRange[0]) + prefix.length;
    const newEnd = (isSelected ? end : selectionRange[0]) + prefix.length;
    return {
      text: before + prefix + targetText + suffix + after,
      selectionRange: [newStart, newEnd],
    };
  }
}
