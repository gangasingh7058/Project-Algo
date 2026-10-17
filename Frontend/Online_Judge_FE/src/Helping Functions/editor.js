// Shared Monaco helpers: a theme matched to the app's surfaces, and common options.

export const EDITOR_THEMES = [
  { value: 'midnight', label: 'Midnight' },
  { value: 'vs-dark', label: 'Dark' },
  { value: 'light', label: 'Light' },
  { value: 'hc-black', label: 'High contrast' },
];

export const FONT_SIZES = [12, 13, 14, 15, 16, 18, 20];

export const LANGUAGES = [
  { value: 'cpp', label: 'C++' },
  { value: 'python', label: 'Python' },
  { value: 'javascript', label: 'JavaScript' },
];

export const toMonacoLanguage = (lang = '') => {
  const l = lang.toLowerCase();
  if (['python', 'py', 'py3'].includes(l)) return 'python';
  if (['javascript', 'js', 'node'].includes(l)) return 'javascript';
  if (l === 'java') return 'java';
  return 'cpp';
};

export const defineEditorThemes = (monaco) => {
  monaco.editor.defineTheme('midnight', {
    base: 'vs-dark',
    inherit: true,
    rules: [],
    colors: {
      'editor.background': '#1c1c1e',
      'editorGutter.background': '#1c1c1e',
      'editor.lineHighlightBackground': '#ffffff08',
      'editor.lineHighlightBorder': '#00000000',
      'editorLineNumber.foreground': '#5a5a5f',
      'editorLineNumber.activeForeground': '#a1a1a6',
      'editor.selectionBackground': '#0a84ff45',
      'editor.inactiveSelectionBackground': '#0a84ff22',
      'editorCursor.foreground': '#0a84ff',
      'editorIndentGuide.background1': '#ffffff0f',
      'editorIndentGuide.activeBackground1': '#ffffff24',
      'editorWidget.background': '#2c2c2e',
      'editorWidget.border': '#ffffff17',
      'editorSuggestWidget.background': '#2c2c2e',
      'editorSuggestWidget.selectedBackground': '#0a84ff40',
      'scrollbarSlider.background': '#ffffff1a',
      'scrollbarSlider.hoverBackground': '#ffffff2e',
      'scrollbarSlider.activeBackground': '#ffffff3d',
    },
  });
};

export const editorOptions = (fontSize, extra = {}) => ({
  fontSize,
  fontFamily: 'ui-monospace, "SF Mono", "Cascadia Code", "JetBrains Mono", Menlo, Consolas, monospace',
  fontLigatures: false,
  lineHeight: Math.round(fontSize * 1.6),
  minimap: { enabled: false },
  padding: { top: 16, bottom: 16 },
  scrollBeyondLastLine: false,
  smoothScrolling: true,
  cursorBlinking: 'smooth',
  cursorSmoothCaretAnimation: 'on',
  roundedSelection: true,
  renderLineHighlight: 'all',
  overviewRulerBorder: false,
  hideCursorInOverviewRuler: true,
  scrollbar: { verticalScrollbarSize: 10, horizontalScrollbarSize: 10, useShadows: false },
  automaticLayout: true,
  ...extra,
});

// Wrap a hint in the comment syntax of the current language
export const asComment = (text, lang) =>
  toMonacoLanguage(lang) === 'python'
    ? '\n' + String(text).split('\n').map((l) => `# ${l}`).join('\n')
    : `\n/*\n${text}\n*/`;
