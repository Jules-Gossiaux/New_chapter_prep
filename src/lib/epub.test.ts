import JSZip from 'jszip';
import { describe, expect, it } from 'vitest';
import { extractTextFromEpub } from './epub';

async function createEpub() {
  const zip = new JSZip();
  zip.file(
    'META-INF/container.xml',
    '<?xml version="1.0"?><container><rootfiles><rootfile full-path="OPS/content.opf" /></rootfiles></container>',
  );
  zip.file(
    'OPS/content.opf',
    '<package><manifest><item id="chapter-1" href="chapter-1.xhtml" media-type="application/xhtml+xml" /><item id="chapter-2" href="chapter-2.xhtml" media-type="application/xhtml+xml" /></manifest><spine><itemref idref="chapter-1" /><itemref idref="chapter-2" /></spine></package>',
  );
  zip.file(
    'OPS/chapter-1.xhtml',
    '<html><body><h1>One</h1><p>Hello world.</p></body></html>',
  );
  zip.file(
    'OPS/chapter-2.xhtml',
    '<html><body><p>Second chapter text.</p></body></html>',
  );
  const blob = await zip.generateAsync({ type: 'blob' });
  return new File([blob], 'book.epub', { type: 'application/epub+zip' });
}

describe('EPUB text extraction', () => {
  it('reads text documents in spine order', async () => {
    const text = await extractTextFromEpub(await createEpub());
    expect(text).toBe('One Hello world.\n\nSecond chapter text.');
  });

  it('rejects non-EPUB files', async () => {
    await expect(
      extractTextFromEpub(
        new File(['text'], 'book.txt', { type: 'text/plain' }),
      ),
    ).rejects.toThrow('Please select an EPUB file.');
  });
});
