type Range = [start: number, end: number];

interface ToggleMdFormatInput {
  text: string;
  selectionRange: Range;
  prefix: string;
  suffix?: string;
}

interface ToggleMDFormatResult {
  text: string;
  selectionRange: Range;
}

export function toggleMDFormat({
  text,
  selectionRange: [start, end],
  prefix,
  suffix = '',
}: ToggleMdFormatInput): ToggleMDFormatResult {
  const selectedText = text.substring(start, end);
  const before = text.substring(0, start);
  const after = text.substring(end);

  const isWrapped = before.endsWith(prefix) && after.startsWith(suffix);

  if (isWrapped && (prefix || suffix)) {
    // Remove format
    return {
      text: before.slice(0, -prefix.length) + selectedText + after.slice(suffix.length),
      selectionRange: [start - prefix.length, end - prefix.length],
    };
  } else {
    // Add format
    return {
      text: before + prefix + selectedText + suffix + after,
      selectionRange: [start + prefix.length, end + prefix.length],
    };
  }
}
