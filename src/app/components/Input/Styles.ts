export default function getStyles(type: string): { [name:string]:string | boolean} {
  const bold = type.includes('bold') || type.includes('action');
  const italics = type.includes('italics') || type.includes('action');
  const strikethrough = type.includes('strikethrough');
  const code = type.includes('code');
  const link = type.includes('link') || type.includes('underline');
  const cursive = type.includes('cursive');
  const serif = type.includes('serif');
  let font;
  if (code) font = 'monospace';
  if (cursive) font = 'cursive';
  if (serif) font = 'serif';
  return {
    'font-weight': bold ? 'bold' : '',
    'font-style': italics ? 'italic' : '',
    'text-decoration': `${strikethrough ? 'line-through' : ''} ${link ? 'underline' : ''}`,
    'font-family': font || 'inherit',
  };
}
