export interface ExtractionProvider {
  extract(input: {
    sourceText: string;
    targetLanguage: string;
  }): Promise<never>;
}
/** Deliberately unimplemented until provider and cost decisions are confirmed. */
export const unavailableExtractionProvider: ExtractionProvider = {
  async extract() {
    throw new Error(
      'Vocabulary extraction is not configured yet. Your chapter text is still safe.',
    );
  },
};
