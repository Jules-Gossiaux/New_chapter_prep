import { countWords } from '../domain';
import pdfWorkerUrl from 'pdfjs-dist/build/pdf.worker.mjs?url';

export type ImportedPdfChapter = {
  title: string;
  sourceText: string;
  words: number;
};

export class PdfTextExtractionError extends Error {
  constructor(message = 'This PDF does not contain extractable text.') {
    super(message);
    this.name = 'PdfTextExtractionError';
  }
}

type PdfTextItem = {
  str?: string;
  hasEOL?: boolean;
};

function normalizePdfText(text: string) {
  return text
    .replace(/\u00ad/g, '')
    .replace(/(\p{L})-\s*\n(?=\p{L})/gu, '$1')
    .replace(/[ \t]+\n/g, '\n')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}

function splitParagraphs(text: string) {
  return normalizePdfText(text)
    .split(/\n\s*\n/)
    .map((paragraph) => paragraph.replace(/\s*\n\s*/g, ' ').trim())
    .filter(Boolean);
}

function splitLongParagraph(paragraph: string, targetWords: number) {
  const sentences = paragraph.split(/(?<=[.!?])\s+/u).filter(Boolean);
  const chunks: string[] = [];
  let current: string[] = [];

  for (const sentence of sentences) {
    current.push(sentence);
    if (countWords(current.join(' ')) >= targetWords) {
      chunks.push(current.join(' '));
      current = [];
    }
  }
  if (current.length) chunks.push(current.join(' '));

  if (chunks.length > 1 || countWords(paragraph) <= targetWords) return chunks;

  const words = paragraph.split(/\s+/);
  return Array.from(
    { length: Math.ceil(words.length / targetWords) },
    (_, index) =>
      words.slice(index * targetWords, (index + 1) * targetWords).join(' '),
  );
}

export function splitTextIntoPdfChapters(text: string, targetWords: number) {
  const paragraphs = splitParagraphs(text);
  const chapters: ImportedPdfChapter[] = [];
  let current: string[] = [];

  for (const paragraph of paragraphs) {
    const paragraphWords = countWords(paragraph);
    if (paragraphWords > 200) {
      if (current.length) {
        chapters.push(
          toImportedChapter(current.join('\n\n'), chapters.length + 1),
        );
        current = [];
      }
      for (const chunk of splitLongParagraph(paragraph, targetWords)) {
        chapters.push(toImportedChapter(chunk, chapters.length + 1));
      }
      continue;
    }

    const candidate = [...current, paragraph].join('\n\n');
    if (current.length && countWords(candidate) > targetWords) {
      chapters.push(
        toImportedChapter(current.join('\n\n'), chapters.length + 1),
      );
      current = [paragraph];
    } else {
      current.push(paragraph);
    }
  }

  if (current.length) {
    chapters.push(toImportedChapter(current.join('\n\n'), chapters.length + 1));
  }
  return chapters;
}

function toImportedChapter(
  sourceText: string,
  number: number,
): ImportedPdfChapter {
  return {
    title: `Chapter ${number}`,
    sourceText,
    words: countWords(sourceText),
  };
}

export async function extractTextFromPdf(file: File) {
  const pdfjs = await import('pdfjs-dist');
  pdfjs.GlobalWorkerOptions.workerSrc = pdfWorkerUrl;
  let document;
  try {
    document = await pdfjs.getDocument({ data: await file.arrayBuffer() })
      .promise;
  } catch (error) {
    const message = error instanceof Error ? error.message : '';
    throw new PdfTextExtractionError(
      message.includes('worker')
        ? 'The PDF reader could not start. Please refresh the page and retry.'
        : 'Unable to read this PDF. Please choose a valid text-based PDF.',
    );
  }
  const pages: string[] = [];

  for (let pageNumber = 1; pageNumber <= document.numPages; pageNumber += 1) {
    const page = await document.getPage(pageNumber);
    const content = await page.getTextContent();
    const items = content.items as PdfTextItem[];
    let pageText = '';
    for (const item of items) {
      const value = item.str ?? '';
      pageText += value;
      pageText += item.hasEOL ? '\n' : ' ';
    }
    pages.push(pageText.trim());
  }

  const text = normalizePdfText(pages.filter(Boolean).join('\n\n'));
  if (!text || countWords(text) === 0) throw new PdfTextExtractionError();
  return text;
}

export async function importTextPdf(file: File, targetWords: number) {
  if (
    file.type !== 'application/pdf' &&
    !file.name.toLowerCase().endsWith('.pdf')
  ) {
    throw new PdfTextExtractionError('Please select a PDF file.');
  }
  const text = await extractTextFromPdf(file);
  return splitTextIntoPdfChapters(text, targetWords);
}
