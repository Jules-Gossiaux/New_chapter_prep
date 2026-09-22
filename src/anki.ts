import initSqlJs, { type Database } from 'sql.js';
import sqlWasmUrl from 'sql.js/dist/sql-wasm.wasm?url';
import JSZip from 'jszip';
import type { VocabularyExportEntry } from './export';

export type AnkiExportOptions = {
  deckName: string;
  includeContext: boolean;
  direction: AnkiDirection;
};

export type AnkiDirection =
  'word-to-translation' | 'translation-to-word' | 'both';

function escapeHtml(value: string) {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

export function ankiFields(
  entry: VocabularyExportEntry,
  includeContext: boolean,
) {
  return [
    escapeHtml(entry.word),
    escapeHtml(entry.translation),
    includeContext ? escapeHtml(entry.context) : '',
  ];
}

function createCollection(
  db: Database,
  entries: VocabularyExportEntry[],
  options: AnkiExportOptions,
) {
  const now = Math.floor(Date.now() / 1000);
  const deckId = now * 1000 + 1;
  const modelId = now * 1000 + 2;
  const model = {
    [modelId]: {
      id: modelId,
      name: 'ChapterPrep Vocabulary',
      type: 0,
      mod: now,
      usn: -1,
      sortf: 0,
      did: null,
      tmpls: [
        ...(options.direction === 'translation-to-word' ||
        options.direction === 'both'
          ? [
              {
                name: 'Translation → word',
                ord: 0,
                qfmt: '{{Translation}}',
                afmt: '{{FrontSide}}<hr id="answer">{{Word}}',
                bqfmt: '',
                bafmt: '',
                did: null,
                bfont: 'Arial',
                bsize: 20,
              },
            ]
          : []),
        ...(options.direction === 'word-to-translation' ||
        options.direction === 'both'
          ? [
              {
                name: 'Word → translation',
                ord: options.direction === 'both' ? 1 : 0,
                qfmt: '{{Word}}',
                afmt: '{{FrontSide}}<hr id="answer">{{Translation}}{{#Example}}<br><br><i>{{Example}}</i>{{/Example}}',
                bqfmt: '',
                bafmt: '',
                did: null,
                bfont: 'Arial',
                bsize: 20,
              },
            ]
          : []),
      ],
      flds: [
        {
          name: 'Word',
          ord: 0,
          sticky: false,
          rtl: false,
          media: [],
          font: 'Arial',
          size: 20,
        },
        {
          name: 'Translation',
          ord: 1,
          sticky: false,
          rtl: false,
          media: [],
          font: 'Arial',
          size: 20,
        },
        {
          name: 'Example',
          ord: 2,
          sticky: false,
          rtl: false,
          media: [],
          font: 'Arial',
          size: 20,
        },
      ],
      tags: [],
      vers: [],
      css: '.card { font-family: arial; font-size: 20px; text-align: center; color: black; background-color: white; }',
      latexPre: '',
      latexPost: '',
      latexsvg: false,
      req:
        options.direction === 'both'
          ? [
              [0, 'all', [1]],
              [1, 'all', [0]],
            ]
          : options.direction === 'translation-to-word'
            ? [[0, 'all', [1]]]
            : [[0, 'all', [0]]],
    },
  };
  const deck = {
    [deckId]: {
      id: deckId,
      name: options.deckName,
      desc: '',
      dyn: 0,
      extendNew: 0,
      extendRev: 0,
      conf: 1,
      collapsed: false,
      browserCollapsed: false,
      newToday: [0, 0],
      revToday: [0, 0],
      lrnToday: [0, 0],
      timeToday: [0, 0],
      usn: -1,
      mod: now,
    },
  };

  db.run(`
    CREATE TABLE col (
      id integer primary key, crt integer not null, mod integer not null,
      scm integer not null, ver integer not null, dty integer not null,
      usn integer not null, ls integer not null, conf text not null,
      models text not null, decks text not null, dconf text not null, tags text not null
    );
    CREATE TABLE notes (
      id integer primary key, guid text not null, mid integer not null,
      mod integer not null, usn integer not null, tags text not null,
      flds text not null, sfld integer not null, csum integer not null,
      flags integer not null, data text not null
    );
    CREATE TABLE cards (
      id integer primary key, nid integer not null, did integer not null,
      ord integer not null, mod integer not null, usn integer not null,
      type integer not null, queue integer not null, due integer not null,
      ivl integer not null, factor integer not null, reps integer not null,
      lapses integer not null, left integer not null, odue integer not null,
      odid integer not null, flags integer not null, data text not null
    );
    CREATE TABLE revlog (
      id integer primary key, cid integer not null, usn integer not null,
      ease integer not null, ivl integer not null, lastIvl integer not null,
      factor integer not null, time integer not null, type integer not null
    );
    CREATE TABLE graves (usn integer not null, oid integer not null, type integer not null);
  `);
  db.run('INSERT INTO col VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)', [
    1,
    now,
    now,
    now,
    11,
    0,
    -1,
    0,
    JSON.stringify({}),
    JSON.stringify(model),
    JSON.stringify(deck),
    JSON.stringify({}),
    '{}',
  ]);

  let cardIndex = 0;
  entries.forEach((entry, index) => {
    const noteId = now * 100000 + index + 1;
    const cardId = noteId + 50000000;
    const fields = ankiFields(entry, options.includeContext).join('\x1f');
    db.run('INSERT INTO notes VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)', [
      noteId,
      `chapterprep-${noteId}`,
      modelId,
      now,
      -1,
      '',
      fields,
      entry.word,
      0,
      0,
      '',
    ]);
    const ordinals =
      options.direction === 'both'
        ? [0, 1]
        : [options.direction === 'translation-to-word' ? 0 : 0];
    ordinals.forEach((ord) => {
      const currentCardId = cardId + cardIndex;
      db.run(
        'INSERT INTO cards VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
        [
          currentCardId,
          noteId,
          deckId,
          ord,
          now,
          -1,
          0,
          0,
          cardIndex + 1,
          0,
          0,
          0,
          0,
          0,
          0,
          0,
          0,
          '',
        ],
      );
      cardIndex += 1;
    });
  });
  return db;
}

export async function createAnkiPackage(
  entries: VocabularyExportEntry[],
  options: AnkiExportOptions,
) {
  const SQL = await initSqlJs({ locateFile: () => sqlWasmUrl });
  const db = createCollection(new SQL.Database(), entries, options);
  const zip = new JSZip();
  zip.file('collection.anki2', db.export());
  zip.file('media', '{}');
  db.close();
  return zip.generateAsync({ type: 'blob' });
}
