export type VocabularyExportFormat = 'csv' | 'txt';

export type VocabularyExportEntry = {
  word: string;
  translation: string;
  context: string;
  bookId: string;
};

export type VocabularyExportOptions = {
  separator: string;
  includeContext: boolean;
  format: VocabularyExportFormat;
};

export function filterVocabularyForExport(
  entries: VocabularyExportEntry[],
  bookId?: string,
) {
  return entries.filter((entry) => !bookId || entry.bookId === bookId);
}

function escapeCell(
  value: string,
  separator: string,
  format: VocabularyExportFormat,
) {
  const normalized = value.replace(/\r?\n/g, ' ');
  const needsQuotes =
    format === 'csv' ||
    normalized.includes(separator) ||
    normalized.includes('"');

  return needsQuotes ? `"${normalized.replace(/"/g, '""')}"` : normalized;
}

export function formatVocabularyExport(
  entries: VocabularyExportEntry[],
  options: VocabularyExportOptions,
) {
  const headers = options.includeContext
    ? ['Word', 'Translation', 'Example']
    : ['Word', 'Translation'];
  const rows = entries.map((entry) =>
    [
      entry.word,
      entry.translation,
      ...(options.includeContext ? [entry.context] : []),
    ]
      .map((cell) => escapeCell(cell, options.separator, options.format))
      .join(options.separator),
  );

  return [
    headers
      .map((header) => escapeCell(header, options.separator, options.format))
      .join(options.separator),
    ...rows,
  ].join('\n');
}
