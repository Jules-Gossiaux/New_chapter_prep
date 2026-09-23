import JSZip from 'jszip';
import { countWords } from '../domain';
import { splitTextIntoPdfChapters } from './pdf';

export class EpubTextExtractionError extends Error {
  constructor(message = 'Unable to read this EPUB file.') {
    super(message);
    this.name = 'EpubTextExtractionError';
  }
}

function normalizeText(text: string) {
  return text
    .replace(/\u00ad/g, '')
    .replace(/\s+/gu, ' ')
    .trim();
}

function resolvePath(basePath: string, relativePath: string) {
  const parts = [
    ...basePath.split('/').slice(0, -1),
    ...relativePath.split('/'),
  ];
  const resolved: string[] = [];
  for (const part of parts) {
    if (!part || part === '.') continue;
    if (part === '..') resolved.pop();
    else resolved.push(part);
  }
  return resolved.join('/');
}

function parseXml(zip: JSZip, path: string) {
  const file = zip.file(path);
  if (!file)
    throw new EpubTextExtractionError('The EPUB package is incomplete.');
  const parser = new DOMParser();
  return file.async('text').then((xml) => {
    const result = parser.parseFromString(xml, 'application/xml');
    if (result.querySelector('parsererror')) {
      throw new EpubTextExtractionError('The EPUB metadata is invalid.');
    }
    return result;
  });
}

export async function extractTextFromEpub(file: File) {
  if (
    file.type !== 'application/epub+zip' &&
    !file.name.toLowerCase().endsWith('.epub')
  ) {
    throw new EpubTextExtractionError('Please select an EPUB file.');
  }

  let zip: JSZip;
  try {
    zip = await JSZip.loadAsync(await file.arrayBuffer());
  } catch {
    throw new EpubTextExtractionError('Unable to open this EPUB file.');
  }

  try {
    const container = await parseXml(zip, 'META-INF/container.xml');
    const rootfile = container
      .getElementsByTagName('rootfile')[0]
      ?.getAttribute('full-path');
    if (!rootfile)
      throw new EpubTextExtractionError(
        'The EPUB package has no content file.',
      );

    const packageDocument = await parseXml(zip, rootfile);
    const manifest = new Map<string, string>();
    Array.from(packageDocument.getElementsByTagName('item')).forEach((item) => {
      const id = item.getAttribute('id');
      const href = item.getAttribute('href');
      if (id && href) {
        const contentPath = decodeURIComponent(href.split('#')[0]);
        manifest.set(id, resolvePath(rootfile, contentPath));
      }
    });
    const chapterPaths = Array.from(
      packageDocument.getElementsByTagName('itemref'),
    )
      .map((item) => manifest.get(item.getAttribute('idref') ?? ''))
      .filter((path): path is string => Boolean(path));

    const chapters: string[] = [];
    for (const path of chapterPaths) {
      const chapterFile = zip.file(path);
      if (!chapterFile) continue;
      const html = await chapterFile.async('text');
      const document = new DOMParser().parseFromString(html, 'text/html');
      const body = document.body;
      body
        ?.querySelectorAll(
          'p, h1, h2, h3, h4, h5, h6, li, blockquote, div, section',
        )
        .forEach((element) => element.append(' '));
      const text = normalizeText(
        body?.textContent ?? document.textContent ?? '',
      );
      if (text && countWords(text) > 0) chapters.push(text);
    }
    const text = chapters.join('\n\n').trim();
    if (!text || countWords(text) === 0) {
      throw new EpubTextExtractionError(
        'This EPUB does not contain extractable text.',
      );
    }
    return text;
  } catch (error) {
    if (error instanceof EpubTextExtractionError) throw error;
    throw new EpubTextExtractionError('Unable to read this EPUB file.');
  }
}

export async function importTextEpub(file: File, targetWords: number) {
  const text = await extractTextFromEpub(file);
  return splitTextIntoPdfChapters(text, targetWords);
}
