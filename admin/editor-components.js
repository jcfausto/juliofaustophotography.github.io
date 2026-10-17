// Editor blocks for the essay includes in _includes/essay-*.html.
// Every parameter an include accepts must be a field here: anything that is
// not a field is dropped when the block is saved.

const ATTRIBUTE = /(\w+)=(?:"([^"]*)"|'([^']*)'|([^\s"'%]+))/g;

const parseAttributes = (text = '') => {
  const values = {};
  for (const match of text.matchAll(ATTRIBUTE)) {
    values[match[1]] = match[2] ?? match[3] ?? match[4];
  }
  return values;
};

const quote = (value) => {
  const text = String(value);
  return text.includes('"') ? `'${text.replaceAll("'", '’')}'` : `"${text}"`;
};

// Writes `{% include name.html a="…"\n   b="…" %}`, skipping empty values.
// Keys listed in `bare` are written unquoted (numbers and booleans).
const toInclude = (name, values, keys, bare = []) => {
  const parts = keys
    .filter((key) => {
      const value = values[key];
      if (bare.includes(key)) return value === true || (typeof value === 'number' && value > 0);
      return value !== undefined && value !== null && String(value).trim() !== '';
    })
    .map((key) => (bare.includes(key) ? `${key}=${values[key]}` : `${key}=${quote(values[key])}`));
  return `{% include ${name}.html${parts.length ? ` ${parts.join('\n   ')}` : ''} %}`;
};

const includePattern = (name) =>
  new RegExp(`^\\{%-?\\s*include\\s+${name.replace('.', '\\.')}\\.html(?<attributes>[\\s\\S]*?)-?%\\}$`, 'm');

const element = (tag, styles = {}, text) => {
  const node = document.createElement(tag);
  Object.assign(node.style, styles);
  if (text !== undefined) node.textContent = text;
  return node;
};

const previewFigure = (images, caption) => {
  const figure = element('figure', { margin: '0', fontFamily: 'system-ui, sans-serif' });
  const row = element('div', { display: 'flex', gap: '8px' });
  images.filter(({ src }) => src).forEach(({ src, alt }) => {
    const img = element('img', { flex: '1', minWidth: '0', maxHeight: '320px', objectFit: 'contain', background: '#f4f1ec' });
    img.setAttribute('src', src);
    img.setAttribute('alt', alt || '');
    row.append(img);
  });
  figure.append(row);
  if (caption) figure.append(element('figcaption', { marginTop: '6px', fontSize: '12px', color: '#4d4855' }, caption));
  return figure;
};

const photoFields = (suffix = '', label = 'Photograph') => [
  { name: `src${suffix}`, label, widget: 'image' },
  { name: `alt${suffix}`, label: `${label}: description (alt text)`, widget: 'string', hint: 'Describe what the photograph shows, for people who cannot see it.' },
  { name: `caption${suffix}`, label: `${label}: caption`, widget: 'string', required: false, hint: 'Optional. Markdown links work.' },
];

const PHOTO_KEYS = ['src', 'alt', 'caption', 'display', 'eager'];

CMS.registerEditorComponent({
  id: 'essay-photo',
  label: 'Photograph',
  icon: 'image',
  fields: [
    ...photoFields(),
    {
      name: 'display',
      label: 'Width',
      widget: 'select',
      default: 'wide',
      options: [
        { label: 'Text column', value: 'text' },
        { label: 'Wide (gallery width)', value: 'wide' },
        { label: 'Full (edge to edge)', value: 'full' },
      ],
    },
    { name: 'eager', label: 'Load immediately (only for a photo at the very top)', widget: 'boolean', required: false, default: false },
  ],
  pattern: includePattern('essay-photo'),
  fromBlock: (match) => {
    const values = parseAttributes(match.groups.attributes);
    return { ...values, display: values.display || 'text', eager: values.eager === 'true' };
  },
  toBlock: (values) => toInclude('essay-photo', values, PHOTO_KEYS, ['eager']),
  toPreview: (values) => previewFigure([{ src: values.src, alt: values.alt }], values.caption),
});

CMS.registerEditorComponent({
  id: 'essay-pair',
  label: 'Two photographs side by side',
  icon: 'view_column_2',
  fields: [
    ...photoFields('1', 'Left photograph'),
    ...photoFields('2', 'Right photograph'),
    { name: 'caption', label: 'Shared caption', widget: 'string', required: false },
    {
      name: 'display',
      label: 'Width',
      widget: 'select',
      default: 'wide',
      options: [
        { label: 'Wide (gallery width)', value: 'wide' },
        { label: 'Text column', value: 'text' },
      ],
    },
  ],
  pattern: includePattern('essay-pair'),
  fromBlock: (match) => {
    const values = parseAttributes(match.groups.attributes);
    return { ...values, display: values.display || 'wide' };
  },
  toBlock: (values) =>
    toInclude('essay-pair', values, ['src1', 'alt1', 'caption1', 'src2', 'alt2', 'caption2', 'caption', 'display']),
  toPreview: (values) =>
    previewFigure(
      [
        { src: values.src1, alt: values.alt1 },
        { src: values.src2, alt: values.alt2 },
      ],
      [values.caption1, values.caption2, values.caption].filter(Boolean).join(' · '),
    ),
});

CMS.registerEditorComponent({
  id: 'essay-aside',
  label: 'Photograph beside the text',
  icon: 'art_track',
  fields: [
    ...photoFields(),
    {
      name: 'side',
      label: 'Side',
      widget: 'select',
      default: 'right',
      options: [
        { label: 'Right', value: 'right' },
        { label: 'Left', value: 'left' },
      ],
    },
    {
      name: 'size',
      label: 'Size',
      widget: 'select',
      default: 'medium',
      options: [
        { label: 'Small', value: 'small' },
        { label: 'Medium', value: 'medium' },
        { label: 'Large (reaches into the margin)', value: 'large' },
      ],
    },
  ],
  pattern: includePattern('essay-aside'),
  fromBlock: (match) => {
    const values = parseAttributes(match.groups.attributes);
    return { ...values, side: values.side || 'right', size: values.size || 'medium' };
  },
  toBlock: (values) => toInclude('essay-aside', values, ['src', 'alt', 'caption', 'side', 'size']),
  toPreview: (values) => previewFigure([{ src: values.src, alt: values.alt }], values.caption),
});

CMS.registerEditorComponent({
  id: 'essay-quote',
  label: 'Pull quote',
  icon: 'format_quote',
  fields: [
    { name: 'text', label: 'Quote', widget: 'text' },
    { name: 'cite', label: 'Attribution', widget: 'string', required: false },
    { name: 'placeholder', label: 'Placeholder (only shown in the local preview)', widget: 'boolean', required: false, default: false },
  ],
  pattern: includePattern('essay-quote'),
  fromBlock: (match) => {
    const values = parseAttributes(match.groups.attributes);
    return { ...values, placeholder: values.placeholder === 'true' };
  },
  toBlock: (values) => toInclude('essay-quote', values, ['text', 'cite', 'placeholder'], ['placeholder']),
  toPreview: (values) => {
    const box = element('blockquote', { margin: '0', padding: '10px 0 0', borderTop: '3px solid #d98600', fontFamily: 'Georgia, serif', fontStyle: 'italic', fontSize: '20px' }, values.text || 'Pull quote');
    if (values.cite) box.append(element('footer', { fontStyle: 'normal', fontSize: '13px', marginTop: '6px' }, values.cite));
    return box;
  },
});

CMS.registerEditorComponent({
  id: 'essay-note',
  label: 'Writing note (local preview only)',
  icon: 'sticky_note_2',
  fields: [{ name: 'text', label: 'Note', widget: 'text', hint: 'Never shown on the live site. Markdown works.' }],
  pattern: includePattern('essay-note'),
  fromBlock: (match) => parseAttributes(match.groups.attributes),
  toBlock: (values) => toInclude('essay-note', values, ['text']),
  toPreview: (values) =>
    element('div', { padding: '8px 12px', border: '1.5px dashed #d98600', fontFamily: 'system-ui, sans-serif', fontSize: '14px' }, `Note: ${values.text || ''}`),
});

CMS.registerEditorComponent({
  id: 'essay-placeholder',
  label: 'Placeholder text (local preview only)',
  icon: 'short_text',
  fields: [{ name: 'paragraphs', label: 'Paragraphs', widget: 'number', value_type: 'int', min: 1, default: 1 }],
  pattern: includePattern('essay-placeholder'),
  fromBlock: (match) => {
    const values = parseAttributes(match.groups.attributes);
    return { paragraphs: Number(values.paragraphs) || 1 };
  },
  toBlock: (values) => toInclude('essay-placeholder', { paragraphs: Number(values.paragraphs) || 1 }, ['paragraphs'], ['paragraphs']),
  toPreview: (values) =>
    element('div', { color: '#a9a4ae', fontFamily: 'system-ui, sans-serif' }, `${Number(values.paragraphs) || 1} paragraph(s) of placeholder text`),
});
