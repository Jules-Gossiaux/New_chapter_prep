import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { dirname } from 'node:path';

const [englishCsv, frenchCsv, outputPath] = process.argv.slice(2);

if (!englishCsv || !frenchCsv || !outputPath) {
  throw new Error(
    'Usage: node scripts/generate-frequency-ranks-migration.mjs <en_top_words.csv> <fr_top_words.csv> <output.sql>',
  );
}

function parseWordRow(line) {
  const separator = line.lastIndexOf(',');
  if (separator < 0) return null;

  let word = line.slice(0, separator).trim();
  if (word.startsWith('"') && word.endsWith('"')) {
    word = word.slice(1, -1).replaceAll('""', '"');
  }

  const sourceCount = Number(line.slice(separator + 1));
  if (!word || !Number.isSafeInteger(sourceCount) || sourceCount < 0) return null;

  const normalizedWord = word
    .normalize('NFKC')
    .toLocaleLowerCase()
    .replace(/[’‘]/g, "'")
    .replace(/^'+|'+$/g, '');
  if (!normalizedWord || normalizedWord.includes('\0')) return null;

  return { word: normalizedWord, sourceCount };
}

async function loadLanguage(languageCode, csvPath) {
  const content = (await readFile(csvPath, 'utf8')).replace(/^\uFEFF/, '');
  const lines = content.split(/\r?\n/);
  if (lines[0]?.trim() !== 'word,count') {
    throw new Error(`${csvPath}: expected CSV header "word,count"`);
  }
  if (lines.length < 15001) {
    throw new Error(`${csvPath}: expected at least 15,000 ranked words`);
  }

  const values = [];
  for (let rank = 10001; rank <= 15000; rank += 1) {
    const parsed = parseWordRow(lines[rank]);
    if (!parsed) continue;

    const quote = (value) => `'${String(value).replaceAll("'", "''")}'`;
    values.push(
      `  (${quote(languageCode)}, ${quote(parsed.word)}, ${rank}, ${parsed.sourceCount}, 'OpenSubtitles2018', 'orgtre/top-open-subtitles-sentences@861f4267cdbb36f4cca4ddfdb2221f1c75bf485b')`,
    );
  }

  if (!values.length) throw new Error(`${csvPath}: no importable rows found`);
  return `-- ${languageCode}: ranks 10,001–15,000 from the source CSV, preserving original ranks.\ninsert into public.vocabulary_frequency (language_code, normalized_word, frequency_rank, source_count, source_name, source_version)\nvalues\n${values.join(',\n')}\non conflict do nothing;`;
}

const englishRows = await loadLanguage('en', englishCsv);
const frenchRows = await loadLanguage('fr', frenchCsv);
const migration = `-- Source: orgtre/top-open-subtitles-sentences, OpenSubtitles2018.\n-- https://github.com/orgtre/top-open-subtitles-sentences\n-- Frequency word lists are published under CC BY 3.0; preserve attribution.\n-- This migration adds only source ranks 10,001–15,000 for English and French.\n\n${englishRows}\n\n${frenchRows}\n`;

await mkdir(dirname(outputPath), { recursive: true });
await writeFile(outputPath, migration, 'utf8');
console.log(`Generated ${outputPath} from the supplied English and French CSV files.`);
