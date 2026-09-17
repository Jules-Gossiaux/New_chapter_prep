import React, { useState } from 'react';
import { createRoot } from 'react-dom/client';
import { createBook, createChapter, type Book } from './domain';
import { LocalStorageRepository } from './persistence';
import './styles.css';
const repo = new LocalStorageRepository();
function App() {
  const [store, setStore] = useState(repo.load());
  const [bookForm, setBookForm] = useState({
    title: '',
    author: '',
    targetLanguage: 'French',
  });
  const [chapterForm, setChapterForm] = useState({
    number: '1',
    title: '',
    sourceText: '',
  });
  const [selected, setSelected] = useState<Book | null>(null);
  const [message, setMessage] = useState('');
  const update = (next: typeof store) => {
    setStore(next);
    repo.save(next);
  };
  const addBook = (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const book = createBook(bookForm);
      update({ ...store, books: [...store.books, book] });
      setSelected(book);
      setBookForm({ title: '', author: '', targetLanguage: 'French' });
      setMessage('Book created.');
    } catch (error) {
      setMessage(
        error instanceof Error ? error.message : 'Could not create book.',
      );
    }
  };
  const addChapter = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selected) return;
    try {
      const chapter = createChapter({ ...chapterForm, bookId: selected.id });
      update({ ...store, chapters: [...store.chapters, chapter] });
      setChapterForm({
        number: String(Number(chapterForm.number) + 1),
        title: '',
        sourceText: '',
      });
      setMessage('Chapter saved locally. Extraction is not configured yet.');
    } catch (error) {
      setMessage(
        error instanceof Error ? error.message : 'Could not save chapter.',
      );
    }
  };
  const chapters = selected
    ? store.chapters.filter((c) => c.bookId === selected.id)
    : [];
  return (
    <main className="shell">
      <header>
        <span className="mark">CP</span>
        <span className="brand">ChapterPrep</span>
        <span className="local-pill">Local-first</span>
      </header>
      <section className="hero">
        <p className="eyebrow">READ WITH CONFIDENCE</p>
        <h1>
          Prepare the words.
          <br />
          <em>Stay in the story.</em>
        </h1>
        <p className="lede">
          A quiet workspace for preparing vocabulary before you read in another
          language.
        </p>
      </section>
      {message && (
        <div className="notice" role="status">
          {message}
        </div>
      )}
      <section className="grid">
        <div className="card">
          <div className="card-heading">
            <div>
              <p className="eyebrow">YOUR LIBRARY</p>
              <h2>Books</h2>
            </div>
            <span className="count">{store.books.length}</span>
          </div>
          {store.books.length === 0 ? (
            <p className="empty">
              Your first book starts here. Add a title to begin preparing a
              chapter.
            </p>
          ) : (
            <div className="book-list">
              {store.books.map((book) => (
                <button
                  className={`book-row ${selected?.id === book.id ? 'active' : ''}`}
                  key={book.id}
                  onClick={() => setSelected(book)}
                >
                  <span className="book-icon">↗</span>
                  <span>
                    <strong>{book.title}</strong>
                    <small>
                      {book.author || 'No author'} · {book.targetLanguage}
                    </small>
                  </span>
                  <span>›</span>
                </button>
              ))}
            </div>
          )}
          <form onSubmit={addBook} className="form">
            <label>
              Book title
              <input
                value={bookForm.title}
                onChange={(e) =>
                  setBookForm({ ...bookForm, title: e.target.value })
                }
                placeholder="e.g. L'Étranger"
              />
            </label>
            <label>
              Author <span className="optional">optional</span>
              <input
                value={bookForm.author}
                onChange={(e) =>
                  setBookForm({ ...bookForm, author: e.target.value })
                }
                placeholder="Albert Camus"
              />
            </label>
            <label>
              Target language
              <input
                value={bookForm.targetLanguage}
                onChange={(e) =>
                  setBookForm({ ...bookForm, targetLanguage: e.target.value })
                }
              />
            </label>
            <button className="primary" type="submit">
              + Add book
            </button>
          </form>
        </div>
        <div className="card chapter-card">
          <div className="card-heading">
            <div>
              <p className="eyebrow">NEXT CHAPTER</p>
              <h2>{selected ? selected.title : 'Choose a book'}</h2>
            </div>
          </div>
          {selected ? (
            <>
              <p className="muted">
                {chapters.length
                  ? `${chapters.length} chapter${chapters.length === 1 ? '' : 's'} saved`
                  : 'No chapters yet'}
              </p>
              <form onSubmit={addChapter} className="form">
                <label>
                  Chapter number
                  <input
                    type="number"
                    min="1"
                    value={chapterForm.number}
                    onChange={(e) =>
                      setChapterForm({ ...chapterForm, number: e.target.value })
                    }
                  />
                </label>
                <label>
                  Chapter title
                  <input
                    value={chapterForm.title}
                    onChange={(e) =>
                      setChapterForm({ ...chapterForm, title: e.target.value })
                    }
                    placeholder="e.g. Chapter one"
                  />
                </label>
                <label>
                  Paste chapter text
                  <textarea
                    value={chapterForm.sourceText}
                    onChange={(e) =>
                      setChapterForm({
                        ...chapterForm,
                        sourceText: e.target.value,
                      })
                    }
                    placeholder="The original text is stored separately and never replaced by generated vocabulary."
                  />
                </label>
                <button className="primary" type="submit">
                  Save chapter
                </button>
              </form>
              {chapters.map((chapter) => (
                <article className="chapter-row" key={chapter.id}>
                  <span className="chapter-number">
                    {String(chapter.number).padStart(2, '0')}
                  </span>
                  <span>
                    <strong>{chapter.title}</strong>
                    <small>
                      {chapter.sourceText.split(/\s+/).filter(Boolean).length}{' '}
                      words · {chapter.extractionStatus.replace('_', ' ')}
                    </small>
                  </span>
                </article>
              ))}
            </>
          ) : (
            <div className="empty centered">
              Select a book or create one to add your first chapter.
            </div>
          )}
        </div>
      </section>
      <footer>
        <span>ChapterPrep foundation · v0.1</span>
        <span>Nothing leaves this device yet.</span>
      </footer>
    </main>
  );
}
createRoot(document.getElementById('root')!).render(<App />);
