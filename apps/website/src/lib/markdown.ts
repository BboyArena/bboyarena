import { marked } from 'marked';

marked.setOptions({
  breaks: false,
  gfm: true
});

export const renderMarkdown = (body?: string[] | string): string => {
  const source = Array.isArray(body) ? body.join('\n\n') : (body ?? '');
  if (!source.trim()) {
    return '';
  }

  return marked.parse(source, { async: false }) as string;
};
