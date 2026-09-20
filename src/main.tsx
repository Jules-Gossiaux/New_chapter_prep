import React, { useEffect, useMemo, useState } from 'react';
import { createRoot } from 'react-dom/client';
import {
  candidates,
  demoBooks,
  readerParagraphs,
  type Candidate,
  type DemoBook,
  type View,
} from './app-model';
import { countWords, MAX_CHAPTER_WORDS } from './domain';
import { getCurrentUser, signIn, signUp } from './lib/auth';
import {
  createBackendBook,
  createBackendChapter,
  deleteBackendBook,
  deleteBackendChapter,
  deleteBackendVocabularyEntry,
  listBackendChapterCandidates,
  listBackendChapters,
  listBooks,
  listBackendVocabularyEntries,
  markBackendBookOpened,
  saveBackendVocabularyEntries,
  type BackendVocabularyEntry,
  type BackendBook,
  updateBackendBook,
  updateBackendChapter,
} from './lib/books';
import { extractVocabulary, translateVocabularyWord } from './lib/extraction';
import { isSupabaseConfigured, supabase } from './lib/supabase';
import './styles.css';

type IconName =
  | 'book'
  | 'grid'
  | 'sparkle'
  | 'bookmark'
  | 'settings'
  | 'arrow'
  | 'plus'
  | 'back'
  | 'check'
  | 'download'
  | 'search'
  | 'menu'
  | 'close'
  | 'chevron';
function Icon({ name }: { name: IconName }) {
  const paths: Record<IconName, string> = {
    book: 'M5 4.5h10a2 2 0 0 1 2 2V18H7a2 2 0 0 0-2 2V4.5Zm0 15.5a2 2 0 0 1 2-2h10M8 8h6M8 11h6',
    grid: 'M4 4h6v6H4zM14 4h6v6h-6zM4 14h6v6H4zM14 14h6v6h-6z',
    sparkle:
      'm12 3 1.2 4.8L18 9l-4.8 1.2L12 15l-1.2-4.8L6 9l4.8-1.2L12 3ZM19 15l.6 2.4L22 18l-2.4.6L19 21l-.6-2.4L16 18l2.4-.6L19 15Z',
    bookmark:
      'M6 4.5A1.5 1.5 0 0 1 7.5 3h9A1.5 1.5 0 0 1 18 4.5V21l-6-3-6 3V4.5Z',
    settings:
      'M12 8.5a3.5 3.5 0 1 0 0 7 3.5 3.5 0 0 0 0-7Zm0-5v2m0 13v2m9-8h-2M7 12H5m13.4-6.4-1.4 1.4M7 17l-1.4 1.4m12.8 0-1.4-1.4M7 7 5.6 5.6',
    arrow: 'M5 12h14m-6-6 6 6-6 6',
    plus: 'M12 5v14M5 12h14',
    back: 'm15 18-6-6 6-6M9 12h10',
    check: 'm5 12 4 4L19 6',
    download: 'M12 4v11m0 0 4-4m-4 4-4-4M5 20h14',
    search: 'm20 20-4.5-4.5m2-5.5a7.5 7.5 0 1 1-15 0 7.5 7.5 0 0 1 15 0Z',
    menu: 'M4 7h16M4 12h16M4 17h16',
    close: 'M6 6l12 12M18 6 6 18',
    chevron: 'm7 10 5 5 5-5',
  };
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24" className="icon">
      <path d={paths[name]} />
    </svg>
  );
}
function Logo({ light = false }: { light?: boolean }) {
  return (
    <div className={`logo ${light ? 'logo-light' : ''}`}>
      <span className="logo-mark">C</span>
      <span>
        chapter<span className="logo-accent">prep</span>
      </span>
    </div>
  );
}
function Button({
  children,
  variant = 'primary',
  onClick,
  className = '',
  type = 'button',
  disabled = false,
}: {
  children: React.ReactNode;
  variant?: 'primary' | 'outline' | 'ghost' | 'soft';
  onClick?: () => void;
  className?: string;
  type?: 'button' | 'submit';
  disabled?: boolean;
}) {
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`button button-${variant} ${className}`}
    >
      {children}
    </button>
  );
}

function Landing({ go }: { go: (view: View) => void }) {
  return (
    <div className="landing-page">
      <nav className="landing-nav">
        <Logo />
        <div className="landing-links">
          <a href="#how">How it works</a>
          <a href="#features">Features</a>
          <a href="#pricing">Pricing</a>
        </div>
        <div className="nav-actions">
          <Button variant="ghost" onClick={() => go('auth')}>
            Log in
          </Button>
          <Button onClick={() => go('auth')}>
            Start for free <Icon name="arrow" />
          </Button>
        </div>
        <button className="mobile-menu">
          <Icon name="menu" />
        </button>
      </nav>
      <section className="landing-hero">
        <div className="hero-copy">
          <span className="kicker">
            <span className="kicker-dot" /> READING, MADE EASIER
          </span>
          <h1>
            Read deeper.
            <br />
            <span>Learn naturally.</span>
          </h1>
          <p>
            Prepare the vocabulary for the chapter you’re about to read — then
            stay in the story with contextual help when you need it.
          </p>
          <div className="hero-actions">
            <Button onClick={() => go('auth')}>
              Start reading for free <Icon name="arrow" />
            </Button>
            <button className="text-link" onClick={() => go('auth')}>
              See how it works <Icon name="arrow" />
            </button>
          </div>
          <div className="social-proof">
            <div className="avatars">
              <span>J</span>
              <span>M</span>
              <span>A</span>
              <span>+</span>
            </div>
            <span>
              Made for curious readers
              <br />
              <small>No credit card required</small>
            </span>
          </div>
        </div>
        <div className="hero-art">
          <div className="art-glow" />
          <div className="paper paper-back">
            <span>“</span>
          </div>
          <div className="paper paper-front">
            <div className="paper-top">
              <span className="paper-label">CHAPTER 01</span>
              <span className="paper-dots">•••</span>
            </div>
            <h3>
              The quiet
              <br />
              <i>between</i> words
            </h3>
            <div className="paper-lines">
              <span />
              <span />
              <span className="short" />
            </div>
            <div className="highlight-word">
              discerning <small>perspicace</small>
            </div>
            <div className="paper-footer">
              The Little Prince <span>01</span>
            </div>
          </div>
          <div className="floating-note">
            <span className="note-icon">
              <Icon name="sparkle" />
            </span>
            <span>
              <b>Focus on what matters</b>
              <small>5 words prepared for your level</small>
            </span>
          </div>
        </div>
      </section>
      <section className="statement">
        <p className="kicker">THE OLD WAY</p>
        <h2>
          Reading shouldn’t feel like
          <br />
          <em>solving a puzzle.</em>
        </h2>
        <p>
          Too many unknown words break your flow. ChapterPrep helps you meet the
          right words before you turn the page.
        </p>
      </section>
      <section className="how-section" id="how">
        <div className="section-heading">
          <span className="kicker">A SIMPLE RHYTHM</span>
          <h2>
            From “I’m stuck”
            <br />
            to <em>“I’m in.”</em>
          </h2>
        </div>
        <div className="step-grid">
          <Step
            number="01"
            icon="book"
            title="Bring your chapter"
            text="Paste the text you want to read next. Your original stays yours, always."
          />
          <Step
            number="02"
            icon="sparkle"
            title="Prepare the right words"
            text="Our AI suggests focused vocabulary tuned to your level and your chapter."
          />
          <Step
            number="03"
            icon="bookmark"
            title="Read with confidence"
            text="Start reading with helpful context nearby — never in the way."
          />
        </div>
      </section>
      <section className="feature-band" id="features">
        <div>
          <span className="kicker">BUILT AROUND READING</span>
          <h2>
            Useful before
            <br />
            <em>and</em> during.
          </h2>
        </div>
        <div className="feature-list">
          <Feature
            title="Level-aware vocabulary"
            text="A focused list, not a wall of words."
          />
          <Feature
            title="Context, not clutter"
            text="See translations where they make sense."
          />
          <Feature
            title="Your words, your choice"
            text="Edit, save, remove, and export anytime."
          />
        </div>
      </section>
      <section className="pricing" id="pricing">
        <span className="kicker">START SIMPLY</span>
        <h2>
          Make your next chapter
          <br />
          <em>feel possible.</em>
        </h2>
        <Button onClick={() => go('auth')}>
          Create your free library <Icon name="arrow" />
        </Button>
      </section>
      <footer className="landing-footer">
        <Logo />
        <span>© 2026 ChapterPrep</span>
        <span>Read more. Stop less.</span>
      </footer>
    </div>
  );
}
function Step({
  number,
  icon,
  title,
  text,
}: {
  number: string;
  icon: IconName;
  title: string;
  text: string;
}) {
  return (
    <article className="step-card">
      <div className="step-top">
        <span className="step-number">{number}</span>
        <span className="step-icon">
          <Icon name={icon} />
        </span>
      </div>
      <h3>{title}</h3>
      <p>{text}</p>
    </article>
  );
}
function Feature({ title, text }: { title: string; text: string }) {
  return (
    <div className="feature-item">
      <span className="feature-check">
        <Icon name="check" />
      </span>
      <span>
        <b>{title}</b>
        <small>{text}</small>
      </span>
    </div>
  );
}

function Auth({ go }: { go: (view: View) => void }) {
  const [mode, setMode] = useState<'login' | 'signup'>('signup');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  return (
    <div className="auth-page">
      <div className="auth-side">
        <nav>
          <Logo light />
        </nav>
        <div className="auth-quote">
          <span className="kicker">YOUR NEXT CHAPTER STARTS HERE</span>
          <h1>
            Make room
            <br />
            for <em>stories.</em>
          </h1>
          <p>
            Build the confidence to read in your target language, one chapter at
            a time.
          </p>
        </div>
        <div className="auth-side-footer">
          <span>“Reading is a form of attention.”</span>
          <span>— Maryanne Wolf</span>
        </div>
      </div>
      <div className="auth-form-side">
        <button className="back-link" onClick={() => go('landing')}>
          <Icon name="back" /> Back to home
        </button>
        <div className="auth-card">
          <div className="auth-head">
            <span className="auth-mobile-logo">
              <Logo />
            </span>
            <span className="kicker">WELCOME TO CHAPTERPREP</span>
            <h2>
              {mode === 'signup'
                ? 'Start your reading habit.'
                : 'Welcome back.'}
            </h2>
            <p>
              {mode === 'signup'
                ? 'Create your free library in less than a minute.'
                : 'Pick up where you left off.'}
            </p>
          </div>
          <div className="auth-tabs">
            <button
              className={mode === 'signup' ? 'active' : ''}
              onClick={() => setMode('signup')}
            >
              Create account
            </button>
            <button
              className={mode === 'login' ? 'active' : ''}
              onClick={() => setMode('login')}
            >
              Log in
            </button>
          </div>
          <form
            onSubmit={async (e) => {
              e.preventDefault();
              setError('');
              setBusy(true);
              const form = new FormData(e.currentTarget);
              try {
                const action = mode === 'signup' ? signUp : signIn;
                const result = await action(
                  String(form.get('email')),
                  String(form.get('password')),
                );
                if (mode === 'signup' && !result.preview && !result.session) {
                  setError(
                    'Check your email to confirm your account, then log in.',
                  );
                  return;
                }
                go('library');
              } catch (authError) {
                setError(
                  authError instanceof Error
                    ? authError.message
                    : 'Authentication failed. Please try again.',
                );
              } finally {
                setBusy(false);
              }
            }}
          >
            <label>
              Email address
              <input
                name="email"
                type="email"
                placeholder="you@example.com"
                required
              />
            </label>
            <label>
              Password
              <input
                type="password"
                name="password"
                placeholder="At least 8 characters"
                minLength={8}
                required
              />
            </label>
            {mode === 'signup' && (
              <label className="check-label">
                <input type="checkbox" required />
                <span>
                  I agree to the <u>Privacy Policy</u> and <u>Terms</u>.
                </span>
              </label>
            )}
            {error && (
              <p className="form-error" role="alert">
                {error}
              </p>
            )}
            <Button type="submit" className="full-button">
              {busy
                ? 'Connecting…'
                : mode === 'signup'
                  ? 'Create my library'
                  : 'Log in'}{' '}
              <Icon name="arrow" />
            </Button>
          </form>
          <div className="auth-divider">
            <span>or continue with</span>
          </div>
          <Button variant="outline" className="full-button google-button">
            <span className="google-g">G</span> Continue with Google
          </Button>
          <p className="auth-note">
            {isSupabaseConfigured
              ? 'Connected to Supabase Auth.'
              : 'Frontend preview · add Supabase environment variables to enable real accounts.'}
          </p>
        </div>
        <p className="auth-footer">
          By continuing, you’re taking the first step toward a better reading
          flow.
        </p>
      </div>
    </div>
  );
}

const VocabularyCountContext = React.createContext(0);

function AppShell({
  children,
  view,
  go,
  savedCount,
}: {
  children: React.ReactNode;
  view: View;
  go: (view: View) => void;
  savedCount?: number;
}) {
  const vocabularyCount = React.useContext(VocabularyCountContext);
  savedCount = savedCount ?? vocabularyCount;
  const [open, setOpen] = useState(false);
  const nav = (target: View) => {
    go(target);
    setOpen(false);
  };
  return (
    <div className="app-shell">
      <aside className={`sidebar ${open ? 'open' : ''}`}>
        <div className="sidebar-top">
          <Logo />
          <button className="sidebar-close" onClick={() => setOpen(false)}>
            <Icon name="close" />
          </button>
        </div>
        <div className="workspace">
          <span className="workspace-label">WORKSPACE</span>
          <button className="workspace-select">
            <span className="workspace-avatar">Y</span>
            <span>Your library</span>
            <Icon name="chevron" />
          </button>
        </div>
        <nav className="app-nav">
          <span className="workspace-label">MENU</span>
          <NavItem
            icon="grid"
            label="Overview"
            active={view === 'library'}
            onClick={() => nav('library')}
          />
          <NavItem
            icon="bookmark"
            label="Vocabulary"
            active={view === 'vocabulary'}
            count={savedCount}
            onClick={() => nav('vocabulary')}
          />
        </nav>
        <div className="sidebar-bottom">
          <button className="sidebar-link" onClick={() => nav('settings')}>
            <Icon name="settings" /> Settings
          </button>
          <div className="profile">
            <span className="profile-avatar">Y</span>
            <span>
              <b>Your account</b>
              <small>Personal workspace</small>
            </span>
            <span className="profile-more">•••</span>
          </div>
        </div>
      </aside>
      {open && (
        <button
          className="sidebar-overlay"
          onClick={() => setOpen(false)}
          aria-label="Close menu"
        />
      )}
      <div className="app-main">
        <header className="app-header">
          <button
            className="mobile-menu app-menu"
            onClick={() => setOpen(true)}
          >
            <Icon name="menu" />
          </button>
          <div className="mobile-brand">
            <Logo />
          </div>
          <div className="header-spacer" />
          <span className="header-status">
            <span />{' '}
            {isSupabaseConfigured ? 'Connected to Supabase' : 'Saved locally'}
          </span>
          <button className="header-avatar">A</button>
        </header>
        {children}
      </div>
    </div>
  );
}
function NavItem({
  icon,
  label,
  active,
  count,
  onClick,
}: {
  icon: IconName;
  label: string;
  active?: boolean;
  count?: number;
  onClick: () => void;
}) {
  return (
    <button className={`nav-item ${active ? 'active' : ''}`} onClick={onClick}>
      <Icon name={icon} /> {label}
      {label === 'Vocabulary' && (
        <span className="nav-count">{count ?? 0}</span>
      )}
    </button>
  );
}

function backendBookToDemo(
  book: BackendBook,
  chapters: DemoBook['chapters'],
): DemoBook {
  return {
    id: book.id,
    title: book.title,
    author: book.author || 'Unknown author',
    language: book.targetLanguage,
    level: book.learnerLevel,
    progress: 0,
    cover: 'custom',
    chapters,
  };
}

function NewBook({
  go,
  onCreate,
}: {
  go: (view: View) => void;
  onCreate: (input: {
    title: string;
    author: string;
    language: string;
    level: string;
  }) => Promise<void>;
}) {
  const [title, setTitle] = useState('');
  const [author, setAuthor] = useState('');
  const [language, setLanguage] = useState('French');
  const [level, setLevel] = useState('B1');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  return (
    <AppShell view="newBook" go={go}>
      <main className="content narrow new-book-page">
        <button className="back-link app-back" onClick={() => go('library')}>
          <Icon name="back" /> Back to library
        </button>
        <div className="new-book-layout">
          <div className="new-book-copy">
            <span className="kicker">A NEW READING JOURNEY</span>
            <h1>Give your next book a place to live.</h1>
            <p>
              Add the basics now. You can always update them later as your
              reading takes shape.
            </p>
            <div className="new-book-tip">
              <Icon name="sparkle" />
              <span>
                <b>Keep it simple.</b>
                <small>Your chapter text comes next.</small>
              </span>
            </div>
          </div>
          <section className="new-book-card">
            <div className="new-book-card-head">
              <span className="kicker">BOOK DETAILS</span>
              <span className="new-book-step">01 / 01</span>
            </div>
            <form
              onSubmit={(event) => {
                event.preventDefault();
                setError('');
                setBusy(true);
                void onCreate({ title, author, language, level })
                  .catch((createError) =>
                    setError(
                      createError instanceof Error
                        ? createError.message
                        : 'Unable to create this book.',
                    ),
                  )
                  .finally(() => setBusy(false));
              }}
            >
              <label>
                Book title
                <input
                  value={title}
                  onChange={(event) => setTitle(event.target.value)}
                  placeholder="e.g. The Little Prince"
                  required
                />
              </label>
              <label>
                Author <span className="optional-label">optional</span>
                <input
                  value={author}
                  onChange={(event) => setAuthor(event.target.value)}
                  placeholder="e.g. Antoine de Saint-Exupéry"
                />
              </label>
              <label>
                Book language
                <select
                  value={language}
                  onChange={(event) => setLanguage(event.target.value)}
                >
                  <option>French</option>
                  <option>English</option>
                  <option>Spanish</option>
                  <option>German</option>
                  <option>Italian</option>
                </select>
              </label>
              <label>
                Your current level
                <select
                  value={level}
                  onChange={(event) => setLevel(event.target.value)}
                >
                  <option>A1</option>
                  <option>A2</option>
                  <option>B1</option>
                  <option>B2</option>
                  <option>C1</option>
                  <option>C2</option>
                </select>
              </label>
              {error && (
                <p className="form-error" role="alert">
                  {error}
                </p>
              )}
              <div className="new-book-actions">
                <Button variant="outline" onClick={() => go('library')}>
                  Cancel
                </Button>
                <Button type="submit">
                  {busy ? 'Creating…' : 'Create book'} <Icon name="arrow" />
                </Button>
              </div>
            </form>
          </section>
        </div>
      </main>
    </AppShell>
  );
}

function Library({
  go,
  books,
  selectBook,
  userLabel,
}: {
  go: (view: View) => void;
  books: DemoBook[];
  selectBook: (book: DemoBook) => void;
  userLabel?: string | null;
}) {
  const currentBook = books[0];
  const currentChapter = currentBook?.chapters[0];
  return (
    <AppShell view="library" go={go}>
      <main className="content">
        <div className="page-intro">
          <div>
            <span className="kicker">YOUR READING SPACE</span>
            <h1>{userLabel ? `Welcome, ${userLabel}.` : 'Your library.'}</h1>
            <p>What story are you stepping into today?</p>
          </div>
          <Button onClick={() => go('newBook')}>
            <Icon name="plus" /> Add a book
          </Button>
        </div>
        {currentBook ? (
          <section className="continue-card">
            <div className={`continue-cover cover-${currentBook.cover}`}>
              <span>{currentBook.title}</span>
            </div>
            <div className="continue-copy">
              <span className="kicker">CONTINUE READING</span>
              <h2>{currentBook.title}</h2>
              <p>
                {currentChapter
                  ? `Chapter ${currentChapter.number} · ${currentChapter.title}`
                  : 'Add your first chapter to begin.'}
              </p>
              <div className="progress-line">
                <span style={{ width: `${currentBook.progress}%` }} />
              </div>
              <div className="progress-meta">
                <span>{currentBook.progress}% complete</span>
                <span>{currentBook.chapters.length} chapters</span>
              </div>
            </div>
            <Button
              variant="soft"
              onClick={() => {
                selectBook(currentBook);
                go('book');
              }}
            >
              {currentChapter ? 'View book' : 'Add a chapter'}{' '}
              <Icon name="arrow" />
            </Button>
          </section>
        ) : (
          <section className="continue-card">
            <div className="continue-copy">
              <span className="kicker">YOUR LIBRARY IS READY</span>
              <h2>Add your first book.</h2>
              <p>Start with the book and chapter you want to read next.</p>
            </div>
            <Button variant="soft" onClick={() => go('newBook')}>
              Add a book <Icon name="arrow" />
            </Button>
          </section>
        )}
        <section className="library-section">
          <div className="section-toolbar">
            <div>
              <span className="kicker">YOUR LIBRARY</span>
              <h2>
                Books <span>{books.length}</span>
              </h2>
            </div>
          </div>
          <div className="book-grid">
            {books.map((book) => (
              <BookCard
                key={book.id}
                book={book}
                onClick={() => {
                  selectBook(book);
                  go('book');
                }}
              />
            ))}
            <button className="add-book-card" onClick={() => go('newBook')}>
              <span>
                <Icon name="plus" />
              </span>
              <b>Add another book</b>
              <small>Start a new reading journey</small>
            </button>
          </div>
        </section>
        <section className="quote-strip">
          <span className="quote-mark">“</span>
          <p>
            Every book is a journey.
            <br />
            <em>Prepare for the best parts.</em>
          </p>
          <span className="quote-author">CHAPTERPREP NOTE 01</span>
        </section>
      </main>
    </AppShell>
  );
}
function BookCard({ book, onClick }: { book: DemoBook; onClick: () => void }) {
  return (
    <button className="book-card" onClick={onClick}>
      <div className={`book-cover cover-${book.cover}`}>
        <span>{book.title}</span>
        <small>{book.language.toUpperCase()}</small>
      </div>
      <div className="book-card-info">
        <div>
          <h3>{book.title}</h3>
          <p>{book.author}</p>
        </div>
        <span className="book-level">{book.level}</span>
      </div>
      <div className="card-progress">
        <span>
          <i style={{ width: `${book.progress}%` }} />
        </span>
        <small>{book.progress}%</small>
      </div>
    </button>
  );
}

function BookDetail({
  book,
  go,
  selectChapter,
  onDeleteBook,
  onDeleteChapter,
  onEditBook,
  onEditChapter,
}: {
  book: DemoBook;
  go: (view: View) => void;
  selectChapter: (chapter: DemoBook['chapters'][number]) => Promise<void>;
  onDeleteBook: (book: DemoBook) => Promise<void>;
  onDeleteChapter: (chapter: DemoBook['chapters'][number]) => Promise<void>;
  onEditBook: (
    book: DemoBook,
    input: { title: string; author: string; language: string },
  ) => Promise<void>;
  onEditChapter: (
    chapter: DemoBook['chapters'][number],
    input: {
      title: string;
      sourceText: string;
      language: string;
      learnerLevel: string;
    },
  ) => Promise<void>;
}) {
  const [error, setError] = useState<string | null>(null);
  const [deleting, setDeleting] = useState<string | null>(null);
  const [editingBook, setEditingBook] = useState(false);
  const [editingChapter, setEditingChapter] = useState<
    DemoBook['chapters'][number] | null
  >(null);
  const openChapter = async (chapter: DemoBook['chapters'][number]) => {
    setError(null);
    try {
      await selectChapter(chapter);
      go('reader');
    } catch {
      setError('Unable to open this chapter. Please retry.');
    }
  };
  const removeBook = async () => {
    if (!window.confirm(`Delete “${book.title}” and all of its chapters?`))
      return;
    setDeleting(book.id);
    setError(null);
    try {
      await onDeleteBook(book);
    } catch {
      setError('Unable to delete this book. Please retry.');
    } finally {
      setDeleting(null);
    }
  };
  const removeChapter = async (chapter: DemoBook['chapters'][number]) => {
    if (
      !window.confirm(`Delete chapter ${chapter.number}: “${chapter.title}”?`)
    )
      return;
    setDeleting(chapter.id);
    setError(null);
    try {
      await onDeleteChapter(chapter);
    } catch {
      setError('Unable to delete this chapter. Please retry.');
    } finally {
      setDeleting(null);
    }
  };
  return (
    <AppShell view="book" go={go}>
      <main className="content narrow">
        <button className="back-link app-back" onClick={() => go('library')}>
          <Icon name="back" /> Back to library
        </button>
        <section className="book-hero">
          <div className={`book-cover large-cover cover-${book.cover}`}>
            <span>{book.title}</span>
            <small>{book.language.toUpperCase()}</small>
          </div>
          <div className="book-hero-copy">
            <span className="kicker">BOOK · {book.language.toUpperCase()}</span>
            <h1>{book.title}</h1>
            <p className="author">{book.author}</p>
            <p className="book-description">
              A personal reading space for your vocabulary, context, and
              progress through this story.
            </p>
            <div className="book-stats">
              <span>
                <b>{book.chapters.length}</b> chapters
              </span>
              <span>
                <b>{book.progress}%</b> complete
              </span>
              <span>
                <b>{book.level}</b> level
              </span>
            </div>
          </div>
          <div className="book-actions">
            <Button onClick={() => go('chapter')}>
              <Icon name="plus" /> Add chapter
            </Button>
            <button
              className="delete-action"
              onClick={() => setEditingBook(true)}
            >
              Edit book
            </button>
            <button
              className="delete-action"
              onClick={removeBook}
              disabled={deleting === book.id}
            >
              {deleting === book.id ? 'Deleting…' : 'Delete book'}
            </button>
          </div>
        </section>
        <div className="chapter-heading">
          <div>
            <span className="kicker">YOUR READING PATH</span>
            <h2>
              Chapters <span>{book.chapters.length}</span>
            </h2>
          </div>
          <button className="sort-button">
            Chapter order <Icon name="chevron" />
          </button>
        </div>
        <section className="chapter-list">
          {book.chapters.map((chapter) => (
            <div className="chapter-card" key={chapter.id}>
              <button
                className="chapter-open"
                onClick={() => void openChapter(chapter)}
              >
                <span className="chapter-index">
                  {String(chapter.number).padStart(2, '0')}
                </span>
                <span className="chapter-info">
                  <b>{chapter.title}</b>
                  <small>
                    {chapter.words
                      ? `${chapter.words.toLocaleString()} words`
                      : 'No text added yet'}
                    {chapter.words ? ' · ' : ''}
                    {chapter.status}
                  </small>
                </span>
                <Status status={chapter.status} />
                <span className="chapter-arrow">
                  <Icon name="arrow" />
                </span>
              </button>
              <button
                className="chapter-delete"
                onClick={() => setEditingChapter(chapter)}
              >
                Edit
              </button>
              <button
                className="chapter-delete"
                onClick={() => void removeChapter(chapter)}
                disabled={deleting === chapter.id}
                aria-label={`Delete ${chapter.title}`}
              >
                {deleting === chapter.id ? '…' : 'Delete'}
              </button>
            </div>
          ))}
        </section>
        {error && (
          <p className="form-error book-error" role="alert">
            {error}
          </p>
        )}
        <div className="book-note">
          <Icon name="sparkle" />
          <span>
            <b>Small steps add up.</b>
            <small>
              Preparing just five words can make the next page feel lighter.
            </small>
          </span>
        </div>
        {editingBook && (
          <EditorModal
            book={book}
            onClose={() => setEditingBook(false)}
            onSave={(input) =>
              void onEditBook(book, input).then(() => setEditingBook(false))
            }
          />
        )}
        {editingChapter && (
          <EditorModal
            book={book}
            chapter={editingChapter}
            onClose={() => setEditingChapter(null)}
            onSave={(input) =>
              void onEditChapter(editingChapter, input).then(() =>
                setEditingChapter(null),
              )
            }
          />
        )}
      </main>
    </AppShell>
  );
}
function EditorModal({
  book,
  chapter,
  onClose,
  onSave,
}: {
  book: DemoBook;
  chapter?: DemoBook['chapters'][number];
  onClose: () => void;
  onSave: (input: {
    title: string;
    author: string;
    language: string;
    learnerLevel: string;
    sourceText: string;
  }) => void;
}) {
  const [title, setTitle] = useState(chapter?.title ?? book.title);
  const [author, setAuthor] = useState(book.author);
  const [language, setLanguage] = useState(chapter?.language ?? book.language);
  const [learnerLevel, setLearnerLevel] = useState(
    chapter?.learnerLevel ?? 'B1',
  );
  const [sourceText, setSourceText] = useState(chapter?.sourceText ?? '');
  const isChapter = Boolean(chapter);
  return (
    <div
      className="editor-modal-backdrop"
      role="presentation"
      onMouseDown={onClose}
    >
      <section
        className="editor-modal"
        role="dialog"
        aria-modal="true"
        aria-label={isChapter ? 'Edit chapter' : 'Edit book'}
        onMouseDown={(event) => event.stopPropagation()}
      >
        <div className="editor-modal-head">
          <div>
            <span className="kicker">
              {isChapter ? 'CHAPTER SETTINGS' : 'BOOK SETTINGS'}
            </span>
            <h2>{isChapter ? 'Edit chapter' : 'Edit book'}</h2>
          </div>
          <button className="panel-close" onClick={onClose}>
            <Icon name="close" />
          </button>
        </div>
        <label>
          Title
          <input
            value={title}
            onChange={(event) => setTitle(event.target.value)}
          />
        </label>
        {!isChapter && (
          <label>
            Author
            <input
              value={author}
              onChange={(event) => setAuthor(event.target.value)}
            />
          </label>
        )}
        <label>
          {isChapter ? 'Chapter language' : 'Default language for new chapters'}
          <select
            value={language}
            onChange={(event) => setLanguage(event.target.value)}
          >
            <option>English</option>
            <option>French</option>
          </select>
        </label>
        {isChapter && (
          <>
            <label>
              Learner level
              <select
                value={learnerLevel}
                onChange={(event) => setLearnerLevel(event.target.value)}
              >
                {['A1', 'A2', 'B1', 'B2', 'C1', 'C2'].map((level) => (
                  <option key={level}>{level}</option>
                ))}
              </select>
            </label>
            <label>
              Chapter text
              <textarea
                value={sourceText}
                onChange={(event) => setSourceText(event.target.value)}
              />
            </label>
          </>
        )}
        <div className="editor-modal-actions">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button
            onClick={() =>
              onSave({ title, author, language, learnerLevel, sourceText })
            }
          >
            Save changes
          </Button>
        </div>
      </section>
    </div>
  );
}
function Status({ status }: { status: string }) {
  return (
    <span className={`status status-${status.toLowerCase().replace(' ', '-')}`}>
      <i />
      {status}
    </span>
  );
}

function ChapterSetup({
  book,
  go,
  onExtract,
  onCreateChapter,
  nextChapterNumber,
}: {
  book: DemoBook;
  go: (view: View) => void;
  onExtract: (input: {
    chapterId: string;
    requestedCount: number;
  }) => Promise<void>;
  onCreateChapter: (input: {
    number: number;
    title: string;
    sourceText: string;
    targetLanguage: string;
    learnerLevel: string;
  }) => Promise<DemoBook['chapters'][number]>;
  nextChapterNumber: number;
}) {
  const [text, setText] = useState('');
  const [level, setLevel] = useState('B1');
  const [language, setLanguage] = useState(book.language);
  const [amount, setAmount] = useState(5);
  const [error, setError] = useState('');
  const [chapterNumber, setChapterNumber] = useState(nextChapterNumber);
  const [chapterTitle, setChapterTitle] = useState(
    `Chapter ${nextChapterNumber}`,
  );
  const [busy, setBusy] = useState(false);
  const wordCount = countWords(text);
  const tooLong = wordCount > MAX_CHAPTER_WORDS;
  return (
    <AppShell view="chapter" go={go}>
      <main className="content narrow">
        <button className="back-link app-back" onClick={() => go('book')}>
          <Icon name="back" /> Back to {book.title}
        </button>
        <div className="setup-header">
          <div>
            <span className="kicker">
              NEW CHAPTER · {book.title.toUpperCase()}
            </span>
            <h1>Prepare your next chapter.</h1>
            <p>
              Tell us what you’re reading and we’ll help you meet the words that
              matter.
            </p>
          </div>
          <span className="step-indicator">
            01 <i /> 02
          </span>
        </div>
        <section className="setup-card">
          <div className="setup-fields">
            <label>
              Chapter number
              <input
                type="number"
                value={chapterNumber}
                onChange={(event) =>
                  setChapterNumber(Number(event.target.value))
                }
                min="1"
              />
            </label>
            <label>
              Chapter title
              <input
                value={chapterTitle}
                onChange={(event) => setChapterTitle(event.target.value)}
              />
            </label>
          </div>
          <label className="select-label">
            Chapter language
            <select
              value={language}
              onChange={(event) => setLanguage(event.target.value)}
            >
              <option value="English">English</option>
              <option value="French">French</option>
            </select>
          </label>
          <label className="select-label">
            Your current level
            <select
              value={level}
              onChange={(event) => setLevel(event.target.value)}
            >
              <option value="A1">A1 · Beginner</option>
              <option value="A2">A2 · Elementary</option>
              <option value="B1">B1 · Intermediate</option>
              <option value="B2">B2 · Upper intermediate</option>
              <option value="C1">C1 · Advanced</option>
              <option value="C2">C2 · Proficient</option>
            </select>
          </label>
          <div className="text-label">
            <label>
              Chapter text <span>Paste the original text below</span>
            </label>
            <textarea
              value={text}
              onChange={(e) => {
                setText(e.target.value);
                setError(
                  countWords(e.target.value) > MAX_CHAPTER_WORDS
                    ? `Chapters are limited to ${MAX_CHAPTER_WORDS.toLocaleString()} words.`
                    : '',
                );
              }}
              placeholder="Paste your chapter text here..."
            />
            <div className="text-meta">
              <span className={tooLong ? 'word-limit-error' : ''}>
                {wordCount.toLocaleString()} /{' '}
                {MAX_CHAPTER_WORDS.toLocaleString()} words
              </span>
              <span>Original text is always preserved</span>
            </div>
          </div>
          <div className="extraction-settings">
            <div>
              <span className="setting-icon">
                <Icon name="sparkle" />
              </span>
              <span>
                <b>Maximum words to prepare</b>
                <small>We only suggest words suited to your level.</small>
              </span>
            </div>
            <div className="range-control">
              <output>{amount}</output>
              <input
                type="range"
                min="1"
                max="50"
                value={amount}
                onChange={(e) => setAmount(Number(e.target.value))}
              />
            </div>
          </div>
          <div className="ai-disclosure">
            <Icon name="sparkle" />
            <span>
              <b>Frequency-guided AI extraction</b>
              <small>
                Frequency ranks select suitable words first; Gemini adds their
                translation and context.
              </small>
            </span>
          </div>
          {error && (
            <p className="form-error" role="alert">
              {error}
            </p>
          )}
          <div className="setup-actions">
            <Button variant="outline" onClick={() => go('book')}>
              Save draft
            </Button>
            <Button
              disabled={tooLong || wordCount === 0}
              onClick={() => {
                setBusy(true);
                setError('');
                void onCreateChapter({
                  number: chapterNumber,
                  title: chapterTitle,
                  sourceText: text,
                  targetLanguage: language,
                  learnerLevel: level,
                })
                  .then((chapter) =>
                    onExtract({
                      chapterId: chapter.id,
                      requestedCount: amount,
                    }),
                  )
                  .catch((createError) =>
                    setError(
                      createError instanceof Error
                        ? createError.message
                        : 'Unable to save this chapter.',
                    ),
                  )
                  .finally(() => setBusy(false));
              }}
            >
              {busy ? 'Extracting…' : 'Extract vocabulary'}{' '}
              <Icon name="arrow" />
            </Button>
          </div>
        </section>
      </main>
    </AppShell>
  );
}

function Review({
  go,
  selected,
  toggle,
  candidateItems,
  notice,
  onSave,
}: {
  go: (view: View) => void;
  selected: Set<string>;
  toggle: (id: string) => void;
  candidateItems: Candidate[];
  notice: string | null;
  onSave: () => Promise<void>;
}) {
  const [query, setQuery] = useState('');
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const visible = candidateItems.filter((c) =>
    c.word.toLowerCase().includes(query.toLowerCase()),
  );
  return (
    <AppShell view="review" go={go}>
      <main className="content narrow">
        <button className="back-link app-back" onClick={() => go('chapter')}>
          <Icon name="back" /> Back to chapter
        </button>
        <div className="review-header">
          <div>
            <span className="kicker">CHAPTER 04 · EXTRACTION COMPLETE</span>
            <h1>Choose your words.</h1>
            <p>
              We found a few words worth meeting before you read. You’re in
              control of what stays.
            </p>
          </div>
          <div className="extraction-badge">
            <span>
              <Icon name="sparkle" />
            </span>
            <b>AI-assisted</b>
            <small>Review before saving</small>
          </div>
        </div>
        {notice && (
          <p className="extraction-notice" role="status">
            {notice}
          </p>
        )}
        <div className="review-toolbar">
          <span>
            <b>{selected.size}</b> of {candidateItems.length} selected
          </span>
          <div className="review-actions">
            <label className="search-box">
              <Icon name="search" />
              <input
                placeholder="Search words"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
              />
            </label>
            <button
              onClick={() =>
                candidateItems.forEach(
                  (c) => !selected.has(c.id) && toggle(c.id),
                )
              }
            >
              Select all
            </button>
          </div>
        </div>
        <section className="candidate-list">
          {visible.map((candidate) => (
            <CandidateCard
              key={candidate.id}
              candidate={candidate}
              checked={selected.has(candidate.id)}
              toggle={() => toggle(candidate.id)}
            />
          ))}
        </section>
        <div className="review-footer">
          <span>
            <Icon name="bookmark" /> These words will be available in your
            reader.
          </span>
          <Button
            disabled={saving}
            onClick={() => {
              setSaving(true);
              setSaveError(null);
              void onSave()
                .then(() => go('prepare'))
                .catch(() =>
                  setSaveError('Unable to save these words. Please retry.'),
                )
                .finally(() => setSaving(false));
            }}
          >
            {saving ? 'Saving…' : `Save ${selected.size} words`}{' '}
            <Icon name="arrow" />
          </Button>
        </div>
        {saveError && (
          <p className="form-error" role="alert">
            {saveError}
          </p>
        )}
      </main>
    </AppShell>
  );
}
function CandidateCard({
  candidate,
  checked,
  toggle,
}: {
  candidate: Candidate;
  checked: boolean;
  toggle: () => void;
}) {
  return (
    <button
      className={`candidate-card ${checked ? 'checked' : ''}`}
      onClick={toggle}
    >
      <span className={`candidate-check ${checked ? 'on' : ''}`}>
        {checked && <Icon name="check" />}
      </span>
      <span className="candidate-main">
        <b>{candidate.word}</b>
        <small>
          {candidate.partOfSpeech} · {candidate.level}
        </small>
        <em>{candidate.context}</em>
      </span>
      <span className="candidate-translation">
        <b>{candidate.translation}</b>
        <small>{candidate.confidence} confidence</small>
      </span>
      <span className="candidate-grip">⠿</span>
    </button>
  );
}

function Prepare({
  go,
  selected,
  candidateItems,
}: {
  go: (view: View) => void;
  selected: Set<string>;
  candidateItems: Candidate[];
}) {
  const [index, setIndex] = useState(0);
  const words = candidateItems.filter((c) => selected.has(c.id));
  const current = words[index] || candidateItems[0];
  return (
    <AppShell view="prepare" go={go}>
      <main className="content prepare-content">
        <button className="back-link app-back" onClick={() => go('book')}>
          <Icon name="back" /> Back to chapter
        </button>
        <div className="prepare-top">
          <div>
            <span className="kicker">A FEW WORDS BEFORE YOU READ</span>
            <h1>Take them with you.</h1>
            <p>A light first pass. No pressure to memorize everything.</p>
          </div>
          <span className="prepare-progress">
            {Math.min(index + 1, words.length)} <i /> {words.length || 5}
          </span>
        </div>
        <div className="prep-card">
          <div className="prep-card-top">
            <span className="kicker">
              WORD{' '}
              {String(Math.min(index + 1, words.length || 1)).padStart(2, '0')}
            </span>
            <span className="prep-level">{current.level}</span>
          </div>
          <h2>{current.word}</h2>
          <p className="prep-translation">{current.translation}</p>
          <span className="part-pill">{current.partOfSpeech}</span>
          <div className="prep-context">
            <span>IN CONTEXT</span>
            <p>{current.context}</p>
          </div>
          <div className="prep-controls">
            <button
              onClick={() => setIndex(Math.max(0, index - 1))}
              disabled={index === 0}
            >
              <Icon name="back" />
            </button>
            <div className="prep-dots">
              {words.map((word, i) => (
                <i className={i === index ? 'active' : ''} key={word.id} />
              ))}
            </div>
            <button
              onClick={() =>
                index < words.length - 1 ? setIndex(index + 1) : go('reader')
              }
            >
              <Icon name="arrow" />
            </button>
          </div>
        </div>
        <div className="prepare-bottom">
          <span>
            <Icon name="sparkle" /> A little context goes a long way.
          </span>
          <Button variant="soft" onClick={() => go('reader')}>
            Start reading <Icon name="arrow" />
          </Button>
        </div>
      </main>
    </AppShell>
  );
}

type WordDetails = Pick<
  Candidate,
  | 'word'
  | 'translation'
  | 'partOfSpeech'
  | 'level'
  | 'context'
  | 'confidence'
  | 'bookId'
>;

type SavedVocabularyItem = WordDetails & {
  id: string;
  bookTitle: string;
  createdAt: string;
};

function toSavedVocabularyItem(
  entry: BackendVocabularyEntry,
): SavedVocabularyItem {
  return {
    id: entry.id,
    word: entry.word,
    translation: entry.translation,
    partOfSpeech: entry.partOfSpeech,
    level: '—',
    context: entry.context,
    confidence: 'Medium',
    bookId: entry.bookId,
    bookTitle: entry.bookTitle,
    createdAt: entry.createdAt,
  };
}

const lookupTranslations: Record<
  string,
  { translation: string; partOfSpeech: string }
> = {
  room: { translation: 'pièce', partOfSpeech: 'noun' },
  quiet: { translation: 'calme', partOfSpeech: 'adjective' },
  arrived: { translation: 'arrivée', partOfSpeech: 'verb' },
  outside: { translation: 'dehors', partOfSpeech: 'adverb' },
  rain: { translation: 'pluie', partOfSpeech: 'noun' },
  window: { translation: 'fenêtre', partOfSpeech: 'noun' },
  city: { translation: 'ville', partOfSpeech: 'noun' },
  letter: { translation: 'lettre', partOfSpeech: 'noun' },
  again: { translation: 'à nouveau', partOfSpeech: 'adverb' },
  sentence: { translation: 'phrase', partOfSpeech: 'noun' },
  mind: { translation: 'esprit', partOfSpeech: 'noun' },
  reader: { translation: 'lecteur / lectrice', partOfSpeech: 'noun' },
  noticed: { translation: 'remarqué', partOfSpeech: 'verb' },
  different: { translation: 'différent', partOfSpeech: 'adjective' },
  tone: { translation: 'ton', partOfSpeech: 'noun' },
  fear: { translation: 'peur', partOfSpeech: 'noun' },
  hope: { translation: 'espoir', partOfSpeech: 'noun' },
  changed: { translation: 'changé', partOfSpeech: 'verb' },
};

function candidateWordDetails(
  word: string,
  candidateItems: Candidate[] = [],
): WordDetails | null {
  const normalized = word.toLowerCase();
  const candidate = candidateItems.find(
    (item) =>
      item.word.toLowerCase() === normalized ||
      item.word.toLowerCase().replace('to ', '') === normalized,
  );
  if (candidate) return candidate;
  return null;
}

function getWordDetails(
  word: string,
  candidateItems: Candidate[] = [],
): WordDetails {
  const candidate = candidateWordDetails(word, candidateItems);
  if (candidate) return candidate;
  const normalized = word.toLowerCase();
  const lookup = lookupTranslations[normalized];
  if (!lookup || isSupabaseConfigured)
    return {
      word,
      translation: 'Translation unavailable',
      partOfSpeech: 'word',
      level: '—',
      context: 'Select this word in the chapter to translate it.',
      confidence: 'Medium',
      bookId: '',
    };
  return {
    word,
    translation: lookup.translation,
    partOfSpeech: lookup.partOfSpeech,
    level: '—',
    context: `Selected from the current chapter: “${word}”.`,
    confidence: 'Medium',
    bookId: 'little-prince',
  };
}

function tokenizeReaderText(
  text: string,
  onWordClick: (word: string) => void,
  candidateItems: Candidate[],
  activeWord?: string | null,
) {
  return text.split(/(\s+)/).map((token, index) => {
    if (/^\s+$/.test(token))
      return <React.Fragment key={`${token}-${index}`}>{token}</React.Fragment>;
    const match = token.match(
      /^([^A-Za-zÀ-ÿ0-9]*)([A-Za-zÀ-ÿ0-9'’-]+)([^A-Za-zÀ-ÿ0-9]*)$/,
    );
    if (!match)
      return <React.Fragment key={`${token}-${index}`}>{token}</React.Fragment>;
    const [, prefix, word, suffix] = match;
    return (
      <React.Fragment key={`${token}-${index}`}>
        <span>{prefix}</span>
        <button
          type="button"
          title={`Translate ${word}`}
          className={`reader-word ${candidateItems.some((candidate) => candidate.word.toLowerCase().replace('to ', '') === word.toLowerCase()) ? 'word-highlight' : ''} ${activeWord?.toLowerCase() === word.toLowerCase() ? 'selected' : ''}`}
          onClick={() => onWordClick(word)}
        >
          {word}
        </button>
        <span>{suffix}</span>
      </React.Fragment>
    );
  });
}

function Reader({
  go,
  saved,
  onSaveWord,
  vocabularyEntries,
  book,
  chapter,
  candidateItems,
}: {
  go: (view: View) => void;
  saved: Set<string>;
  onSaveWord: (word: WordDetails) => Promise<void>;
  vocabularyEntries: SavedVocabularyItem[];
  book: DemoBook;
  chapter: DemoBook['chapters'][number];
  candidateItems: Candidate[];
}) {
  const [activeWord, setActiveWord] = useState<string | null>(null);
  const [lookups, setLookups] = useState<Record<string, WordDetails>>({});
  const [translationError, setTranslationError] = useState<string | null>(null);
  const [translating, setTranslating] = useState(false);
  const [fontSize, setFontSize] = useState(20);
  const active = activeWord
    ? (candidateWordDetails(activeWord, candidateItems) ??
      lookups[activeWord.toLowerCase()] ??
      (!isSupabaseConfigured
        ? getWordDetails(activeWord, candidateItems)
        : null))
    : null;
  const paragraphs = chapter.sourceText
    ? chapter.sourceText.split(/\n{2,}/).filter(Boolean)
    : readerParagraphs;
  const exportEntries = isSupabaseConfigured
    ? vocabularyEntries
    : Array.from(saved).map((word) => ({
        ...getWordDetails(word, candidateItems),
        id: word,
        bookTitle: book.title,
        createdAt: '',
      }));
  return (
    <AppShell view="reader" go={go} savedCount={saved.size}>
      <main className="reader-page">
        <div className="reader-top">
          <button className="back-link" onClick={() => go('book')}>
            <Icon name="back" /> {book.title}
          </button>
          <div className="reader-title">
            <span className="kicker">
              READING · CHAPTER {String(chapter.number).padStart(2, '0')}
            </span>
            <h1>{chapter.title}</h1>
          </div>
          <div className="reader-tools">
            <button onClick={() => setFontSize(Math.max(16, fontSize - 1))}>
              A−
            </button>
            <button onClick={() => setFontSize(Math.min(26, fontSize + 1))}>
              A+
            </button>
            <button onClick={() => go('vocabulary')}>
              <Icon name="bookmark" />
            </button>
            <button onClick={() => exportVocabulary(exportEntries, book.id)}>
              <Icon name="download" />
            </button>
          </div>
        </div>
        <div className="reader-layout">
          <article className="reading-paper">
            <div className="reading-meta">
              <span>CHAPTER {String(chapter.number).padStart(2, '0')}</span>
              <span>{chapter.words} WORDS</span>
            </div>
            <h2>{chapter.title}</h2>
            <div className="reading-copy" style={{ fontSize: `${fontSize}px` }}>
              {paragraphs.map((paragraph, index) => (
                <p key={`${index}-${paragraph}`}>
                  {tokenizeReaderText(
                    paragraph,
                    (word) => {
                      setActiveWord(word);
                      setTranslationError(null);
                      if (
                        candidateWordDetails(word, candidateItems) ||
                        lookups[word.toLowerCase()] ||
                        translating ||
                        !isSupabaseConfigured
                      )
                        return;
                      setTranslating(true);
                      void translateVocabularyWord({
                        chapterId: chapter.id,
                        word,
                      })
                        .then((result) => {
                          setLookups((old) => ({
                            ...old,
                            [word.toLowerCase()]: {
                              word: result.word,
                              translation: result.translation,
                              partOfSpeech: result.partOfSpeech,
                              level: '—',
                              context: result.context,
                              confidence: result.confidence,
                              bookId: book.id,
                            },
                          }));
                        })
                        .catch((error: unknown) => {
                          setTranslationError(
                            error instanceof Error
                              ? error.message
                              : 'The word could not be translated. Please retry.',
                          );
                        })
                        .finally(() => setTranslating(false));
                    },
                    candidateItems,
                    activeWord,
                  )}
                </p>
              ))}
            </div>
            <div className="reader-end">
              <span>— End of chapter —</span>
              <Button variant="soft" onClick={() => go('book')}>
                Back to chapters
              </Button>
            </div>
          </article>
          <aside className="reader-aside">
            {active || (activeWord && translating) ? (
              <div className="word-panel">
                <button
                  className="panel-close"
                  onClick={() => setActiveWord(null)}
                >
                  <Icon name="close" />
                </button>
                <span className="kicker">CONTEXTUAL HELP</span>
                <h2>{active?.word ?? activeWord}</h2>
                <p className="word-definition">
                  {active ? active.translation : 'Translating…'}
                </p>
                {active && (
                  <span className="part-pill">{active.partOfSpeech}</span>
                )}
                <div className="panel-context">
                  <span>FROM THIS CHAPTER</span>
                  <p>
                    {active?.context ?? 'Finding the word in this chapter…'}
                  </p>
                </div>
                {active && (
                  <Button
                    className="full-button"
                    variant={saved.has(active.word) ? 'soft' : 'primary'}
                    onClick={() =>
                      void onSaveWord(active).catch(() =>
                        setTranslationError(
                          'Unable to save this word. Please retry.',
                        ),
                      )
                    }
                  >
                    {saved.has(active.word) ? (
                      <>
                        <Icon name="check" /> Saved to vocabulary
                      </>
                    ) : (
                      <>
                        <Icon name="bookmark" /> Add to my words
                      </>
                    )}
                  </Button>
                )}
              </div>
            ) : (
              <div className="reader-help">
                <span className="help-icon">
                  <Icon name="bookmark" />
                </span>
                <h3>Words, when you need them.</h3>
                <p>
                  Select a highlighted word to see its translation and context
                  without leaving the page.
                </p>
              </div>
            )}
            {translationError && (
              <p className="form-error" role="alert">
                {translationError}
              </p>
            )}
            <div className="my-words-panel">
              <div className="aside-heading">
                <span>
                  <span className="kicker">THIS CHAPTER</span>
                  <b>{candidateItems.length} prepared</b>
                </span>
              </div>
              {candidateItems.map((details) => {
                return (
                  <button
                    className="mini-word"
                    key={details.id}
                    onClick={() => setActiveWord(details.word)}
                  >
                    <b>{details.word}</b>
                    <span>→</span>
                    <small>{details.translation}</small>
                  </button>
                );
              })}
              {candidateItems.length === 0 && (
                <p className="aside-empty">
                  No vocabulary has been prepared for this chapter yet.
                </p>
              )}
            </div>
          </aside>
        </div>
      </main>
    </AppShell>
  );
}
function exportVocabulary(entries: SavedVocabularyItem[], bookId?: string) {
  const rows = entries.filter((entry) => !bookId || entry.bookId === bookId);
  const csv = [
    ['Front', 'Back', 'Context'],
    ...rows.map((entry) => [entry.word, entry.translation, entry.context]),
  ]
    .map((row) => row.map((cell) => `"${cell.replace(/"/g, '""')}"`).join(','))
    .join('\n');
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = 'chapterprep-vocabulary.csv';
  link.click();
  URL.revokeObjectURL(url);
}

function Vocabulary({
  go,
  saved,
  entries,
  onRemove,
  candidateItems,
}: {
  go: (view: View) => void;
  saved: Set<string>;
  entries: SavedVocabularyItem[];
  onRemove: (entry: SavedVocabularyItem) => Promise<void>;
  candidateItems: Candidate[];
}) {
  const [query, setQuery] = useState('');
  const [bookFilter, setBookFilter] = useState('all');
  const [sort, setSort] = useState('newest');
  const [removingId, setRemovingId] = useState<string | null>(null);
  const [removeError, setRemoveError] = useState<string | null>(null);
  const savedWords = isSupabaseConfigured
    ? entries
    : Array.from(saved).map((word) => ({
        ...getWordDetails(word, candidateItems),
        id: word,
        bookTitle: 'The Little Prince',
        createdAt: '',
      }));
  const filteredWords = savedWords.filter(
    (word) =>
      (bookFilter === 'all' || word.bookId === bookFilter) &&
      word.word.toLowerCase().includes(query.toLowerCase()),
  );
  const words = [...filteredWords].sort((a, b) =>
    sort === 'alphabetical' ? a.word.localeCompare(b.word) : 0,
  );
  return (
    <AppShell view="vocabulary" go={go} savedCount={saved.size}>
      <main className="content narrow">
        <div className="vocabulary-head">
          <div>
            <span className="kicker">YOUR PERSONAL LIST</span>
            <h1>Vocabulary worth keeping.</h1>
            <p>Words you’ve chosen to carry into your next chapter.</p>
          </div>
          <Button
            onClick={() =>
              exportVocabulary(
                savedWords,
                bookFilter === 'all' ? undefined : bookFilter,
              )
            }
          >
            <Icon name="download" /> Export CSV
          </Button>
        </div>
        <div className="vocabulary-toolbar">
          <div className="search-box">
            <Icon name="search" />
            <input
              placeholder="Search your words"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
          </div>
          <label className="filter-button filter-select">
            <select
              value={bookFilter}
              onChange={(event) => setBookFilter(event.target.value)}
            >
              <option value="all">All books</option>
              {Array.from(
                new Map(
                  savedWords.map((word) => [word.bookId, word.bookTitle]),
                ),
              ).map(([bookId, bookTitle]) => (
                <option key={bookId} value={bookId}>
                  {bookTitle}
                </option>
              ))}
            </select>
            <Icon name="chevron" />
          </label>
          <label className="filter-button filter-select">
            <select
              value={sort}
              onChange={(event) => setSort(event.target.value)}
            >
              <option value="newest">Newest first</option>
              <option value="alphabetical">A–Z</option>
            </select>
            <Icon name="chevron" />
          </label>
        </div>
        <section className="vocab-list">
          {words.length ? (
            words.map((word) => (
              <article className="vocab-card" key={word.word}>
                <span className="vocab-letter">
                  {word.word[0].toUpperCase()}
                </span>
                <span className="vocab-word">
                  <b>{word.word}</b>
                  <small>
                    {word.partOfSpeech} · {word.bookTitle}
                  </small>
                </span>
                <span className="vocab-meaning">
                  <b>{word.translation}</b>
                  <small>{word.context}</small>
                </span>
                <button
                  className="vocab-more"
                  disabled={removingId === word.id}
                  onClick={() => {
                    setRemovingId(word.id);
                    setRemoveError(null);
                    void onRemove(word)
                      .catch(() =>
                        setRemoveError(
                          'Unable to remove this word. Please retry.',
                        ),
                      )
                      .finally(() => setRemovingId(null));
                  }}
                >
                  {removingId === word.id ? 'Removing…' : 'Remove'}
                </button>
              </article>
            ))
          ) : (
            <div className="vocab-empty">
              <span>
                <Icon name="bookmark" />
              </span>
              <h3>Your list is still quiet.</h3>
              <p>Save words while reading and they’ll gather here.</p>
              <Button variant="soft" onClick={() => go('reader')}>
                Open the reader <Icon name="arrow" />
              </Button>
            </div>
          )}
        </section>
        {removeError && (
          <p className="form-error" role="alert">
            {removeError}
          </p>
        )}
        <div className="export-note">
          <Icon name="download" />
          <span>
            <b>Take your words anywhere.</b>
            <small>
              CSV export is ready for Anki or your own study workflow.
            </small>
          </span>
          <button
            onClick={() =>
              exportVocabulary(
                savedWords,
                bookFilter === 'all' ? undefined : bookFilter,
              )
            }
          >
            Export <Icon name="arrow" />
          </button>
        </div>
      </main>
    </AppShell>
  );
}

function App() {
  const [view, setView] = useState<View>('landing');
  const [authReady, setAuthReady] = useState(!isSupabaseConfigured);
  const [theme, setTheme] = useState<'light' | 'dark'>(() =>
    localStorage.getItem('chapterprep-theme') === 'dark' ? 'dark' : 'light',
  );
  const [books, setBooks] = useState<DemoBook[]>(
    isSupabaseConfigured ? [] : demoBooks,
  );
  const [selectedBook, setSelectedBook] = useState<DemoBook | null>(
    isSupabaseConfigured ? null : demoBooks[0],
  );
  const [selectedChapter, setSelectedChapter] = useState<
    DemoBook['chapters'][number] | null
  >(null);
  const [userLabel, setUserLabel] = useState<string | null>(null);
  const [candidateItems, setCandidateItems] = useState<Candidate[]>(
    isSupabaseConfigured ? [] : candidates,
  );
  const [extractionNotice, setExtractionNotice] = useState<string | null>(null);
  const [selected, setSelected] = useState<Set<string>>(
    new Set(candidates.map((c) => c.id)),
  );
  const [saved, setSaved] = useState<Set<string>>(
    isSupabaseConfigured
      ? new Set()
      : new Set(['discerning', 'unsettling', 'to linger', 'faintly']),
  );
  const [vocabularyEntries, setVocabularyEntries] = useState<
    SavedVocabularyItem[]
  >([]);
  const go = (next: View) => setView(next);
  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    localStorage.setItem('chapterprep-theme', theme);
  }, [theme]);
  const toggle = (id: string) =>
    setSelected((old) => {
      const next = new Set(old);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  const refreshVocabulary = async () => {
    if (!isSupabaseConfigured) return;
    const entries = (await listBackendVocabularyEntries()).map(
      toSavedVocabularyItem,
    );
    setVocabularyEntries(entries);
    setSaved(new Set(entries.map((entry) => entry.word)));
  };

  const saveWord = async (word: WordDetails) => {
    if (!isSupabaseConfigured) {
      setSaved((old) => new Set(old).add(word.word));
      return;
    }
    if (!selectedChapter) throw new Error('SELECT_CHAPTER_REQUIRED');
    await saveBackendVocabularyEntries({
      chapterId: selectedChapter.id,
      entries: [word],
    });
    await refreshVocabulary();
  };

  const removeVocabularyWord = async (entry: SavedVocabularyItem) => {
    if (!isSupabaseConfigured) {
      setSaved((old) => {
        const next = new Set(old);
        next.delete(entry.word);
        return next;
      });
      return;
    }
    await deleteBackendVocabularyEntry(entry.id);
    setVocabularyEntries((old) => old.filter((word) => word.id !== entry.id));
    setSaved((old) => {
      const next = new Set(old);
      next.delete(entry.word);
      return next;
    });
  };

  const refreshBooks = async () => {
    if (!isSupabaseConfigured) return;
    const user = await getCurrentUser().catch(() => null);
    if (!user) {
      setUserLabel(null);
      setBooks([]);
      setSelectedBook(null);
      setSelectedChapter(null);
      setVocabularyEntries([]);
      setSaved(new Set());
      return false;
    }
    setUserLabel(user.email ?? 'Reader');
    const backendBooks = await listBooks();
    const loadedBooks = await Promise.all(
      backendBooks.map(async (book) => {
        const chapters = await listBackendChapters(book.id);
        return backendBookToDemo(
          book,
          chapters.map((chapter) => ({
            id: chapter.id,
            number: chapter.number,
            title: chapter.title,
            words: chapter.wordCount,
            sourceText: chapter.sourceText,
            language: chapter.targetLanguage,
            learnerLevel: chapter.learnerLevel,
            status:
              chapter.extractionStatus === 'complete'
                ? ('Ready' as const)
                : chapter.extractionStatus === 'pending'
                  ? ('In progress' as const)
                  : ('Not started' as const),
          })),
        );
      }),
    );
    setBooks(loadedBooks);
    setSelectedBook(loadedBooks[0] ?? null);
    setSelectedChapter(null);
    return true;
  };

  useEffect(() => {
    if (!supabase) return;
    let active = true;
    void supabase.auth.getSession().then(({ data: { session } }) => {
      if (!active) return;
      if (!session) {
        setAuthReady(true);
        return;
      }
      void Promise.all([refreshBooks(), refreshVocabulary()]).finally(() => {
        if (!active) return;
        setView('library');
        setAuthReady(true);
      });
    });
    const { data } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!active || !session) return;
      void Promise.all([refreshBooks(), refreshVocabulary()]);
    });
    return () => {
      active = false;
      data.subscription.unsubscribe();
    };
  }, []);

  const openChapter = async (chapter: DemoBook['chapters'][number]) => {
    setSelectedChapter(chapter);
    setCandidateItems([]);
    setSelected(new Set());
    if (!isSupabaseConfigured) {
      setCandidateItems(candidates);
      setSelected(new Set(candidates.map((candidate) => candidate.id)));
      return;
    }
    if (selectedBook) {
      const openedBookId = selectedBook.id;
      void markBackendBookOpened(openedBookId)
        .then(() =>
          setBooks((old) => {
            const openedBook = old.find((book) => book.id === openedBookId);
            return openedBook
              ? [openedBook, ...old.filter((book) => book.id !== openedBook.id)]
              : old;
          }),
        )
        .catch(() => undefined);
    }
    const loaded = await listBackendChapterCandidates(chapter.id);
    const chapterCandidates = loaded.map((candidate) => ({
      id: candidate.id,
      bookId: selectedBook?.id ?? '',
      word: candidate.word,
      translation: candidate.translation,
      partOfSpeech: candidate.partOfSpeech,
      level: candidate.level,
      context: candidate.context,
      confidence: candidate.confidence,
    }));
    setCandidateItems(chapterCandidates);
    setSelected(new Set(chapterCandidates.map((candidate) => candidate.id)));
  };

  const createBook = async (input: {
    title: string;
    author: string;
    language: string;
    level: string;
  }) => {
    const book = isSupabaseConfigured
      ? backendBookToDemo(
          await createBackendBook({
            title: input.title,
            author: input.author,
            targetLanguage: input.language,
            learnerLevel: input.level,
          }),
          [],
        )
      : {
          id: `book-${Date.now()}`,
          title: input.title.trim() || 'Untitled book',
          author: input.author.trim() || 'Unknown author',
          language: input.language,
          level: input.level,
          progress: 0,
          cover: 'stranger',
          chapters: [],
        };
    setBooks((old) => [...old, book]);
    setSelectedBook(book);
    go('book');
  };

  const createChapter = async (input: {
    number: number;
    title: string;
    sourceText: string;
    targetLanguage: string;
    learnerLevel: string;
  }) => {
    if (!selectedBook) throw new Error('SELECT_BOOK_REQUIRED');
    const chapter = isSupabaseConfigured
      ? await createBackendChapter({
          bookId: selectedBook.id,
          number: input.number,
          title: input.title,
          sourceText: input.sourceText,
          targetLanguage: input.targetLanguage,
          learnerLevel: input.learnerLevel,
        })
      : {
          id: `chapter-${Date.now()}`,
          number: input.number,
          title: input.title,
          words: countWords(input.sourceText),
          status: 'Not started' as const,
          language: input.targetLanguage,
          learnerLevel: input.learnerLevel,
        };
    const createdChapter = {
      id: chapter.id,
      number: chapter.number,
      title: chapter.title,
      words: 'wordCount' in chapter ? chapter.wordCount : chapter.words,
      sourceText:
        'sourceText' in chapter ? chapter.sourceText : input.sourceText,
      status: 'Not started' as const,
      language:
        'targetLanguage' in chapter
          ? chapter.targetLanguage
          : input.targetLanguage,
      learnerLevel:
        'learnerLevel' in chapter ? chapter.learnerLevel : input.learnerLevel,
    };
    const nextBook = {
      ...selectedBook,
      chapters: [...selectedBook.chapters, createdChapter],
    };
    setSelectedChapter(createdChapter);
    setCandidateItems([]);
    setSelected(new Set());
    setSelectedBook(nextBook);
    setBooks((old) =>
      old.map((book) => (book.id === nextBook.id ? nextBook : book)),
    );
    return createdChapter;
  };
  const removeBook = async (book: DemoBook) => {
    if (isSupabaseConfigured) await deleteBackendBook(book.id);
    setBooks((old) => old.filter((item) => item.id !== book.id));
    setSelectedBook(null);
    setSelectedChapter(null);
    setCandidateItems([]);
    setSelected(new Set());
    go('library');
  };
  const editBook = async (
    book: DemoBook,
    input: { title: string; author: string; language: string },
  ) => {
    const { title, author, language } = input;
    const updated = isSupabaseConfigured
      ? backendBookToDemo(
          await updateBackendBook(book.id, {
            title,
            author,
            targetLanguage: language,
          }),
          book.chapters,
        )
      : { ...book, title, author, language };
    setSelectedBook(updated);
    setBooks((old) =>
      old.map((item) => (item.id === book.id ? updated : item)),
    );
  };
  const editChapter = async (
    chapter: DemoBook['chapters'][number],
    input: {
      title: string;
      sourceText: string;
      language: string;
      learnerLevel: string;
    },
  ) => {
    if (!selectedBook) return;
    const { title, language, sourceText, learnerLevel: level } = input;
    const updatedBackend = isSupabaseConfigured
      ? await updateBackendChapter(chapter.id, {
          number: chapter.number,
          title,
          sourceText,
          targetLanguage: language,
          learnerLevel: level,
        })
      : null;
    const updated = {
      ...chapter,
      title,
      sourceText,
      words: updatedBackend?.wordCount ?? countWords(sourceText),
      language,
      learnerLevel: level,
      status: 'Not started' as const,
    };
    const nextBook = {
      ...selectedBook,
      chapters: selectedBook.chapters.map((item) =>
        item.id === chapter.id ? updated : item,
      ),
    };
    setSelectedBook(nextBook);
    setBooks((old) =>
      old.map((item) => (item.id === nextBook.id ? nextBook : item)),
    );
  };
  const removeChapter = async (chapter: DemoBook['chapters'][number]) => {
    if (!selectedBook) throw new Error('SELECT_BOOK_REQUIRED');
    if (isSupabaseConfigured) await deleteBackendChapter(chapter.id);
    const updated = {
      ...selectedBook,
      chapters: selectedBook.chapters.filter((item) => item.id !== chapter.id),
    };
    setSelectedBook(updated);
    setBooks((old) =>
      old.map((item) => (item.id === updated.id ? updated : item)),
    );
    if (selectedChapter?.id === chapter.id) {
      setSelectedChapter(null);
      setCandidateItems([]);
      setSelected(new Set());
    }
  };
  const extractChapter = async ({
    chapterId,
    requestedCount,
  }: {
    chapterId: string;
    requestedCount: number;
  }) => {
    if (!isSupabaseConfigured) {
      const preview = candidates.slice(0, requestedCount);
      setCandidateItems(preview);
      setSelected(new Set(preview.map((candidate) => candidate.id)));
      setExtractionNotice(null);
      go('review');
      return;
    }
    const result = await extractVocabulary({ chapterId, requestedCount });
    const extracted = result.items.map((item) => ({
      id: item.id,
      bookId: selectedBook?.id ?? '',
      word: item.word,
      translation: item.translation,
      partOfSpeech: item.partOfSpeech,
      level: item.level,
      context: item.context,
      confidence: item.confidence,
    }));
    setCandidateItems(extracted);
    setSelected(new Set(extracted.map((candidate) => candidate.id)));
    setExtractionNotice(
      result.items.length === 0
        ? 'No new words from the supported frequency range were found for this level in this chapter.'
        : result.eligibleCount > 50
          ? `This chapter contains ${result.eligibleCount} level-appropriate words. We selected the most frequent ones first; keep the list focused before reading.`
          : null,
    );
    go('review');
  };
  const page = useMemo(() => {
    if (!authReady) return null;
    if (view === 'landing') return <Landing go={go} />;
    if (view === 'auth') return <Auth go={go} />;
    if (view === 'settings')
      return (
        <AppShell view="settings" go={go}>
          <main className="content narrow">
            <span className="kicker">APPLICATION SETTINGS</span>
            <h1>Make ChapterPrep yours.</h1>
            <section className="setup-card settings-card">
              <h2>Appearance</h2>
              <p>Choose the interface that is easiest on your eyes.</p>
              <div className="theme-options">
                <Button
                  variant={theme === 'light' ? 'primary' : 'outline'}
                  onClick={() => setTheme('light')}
                >
                  Light mode
                </Button>
                <Button
                  variant={theme === 'dark' ? 'primary' : 'outline'}
                  onClick={() => setTheme('dark')}
                >
                  Dark mode
                </Button>
              </div>
            </section>
          </main>
        </AppShell>
      );
    if (view === 'library')
      return (
        <Library
          go={go}
          books={books}
          selectBook={setSelectedBook}
          userLabel={userLabel}
        />
      );
    if (view === 'newBook') return <NewBook go={go} onCreate={createBook} />;
    if (view === 'book')
      return selectedBook ? (
        <BookDetail
          book={selectedBook}
          go={go}
          selectChapter={openChapter}
          onDeleteBook={removeBook}
          onDeleteChapter={removeChapter}
          onEditBook={editBook}
          onEditChapter={editChapter}
        />
      ) : (
        <Library
          go={go}
          books={books}
          selectBook={setSelectedBook}
          userLabel={userLabel}
        />
      );
    if (view === 'chapter')
      return selectedBook ? (
        <ChapterSetup
          book={selectedBook}
          go={go}
          onExtract={extractChapter}
          onCreateChapter={createChapter}
          nextChapterNumber={
            Math.max(
              0,
              ...selectedBook.chapters.map((chapter) => chapter.number),
            ) + 1
          }
        />
      ) : (
        <Library
          go={go}
          books={books}
          selectBook={setSelectedBook}
          userLabel={userLabel}
        />
      );
    if (view === 'review')
      return (
        <Review
          go={go}
          selected={selected}
          toggle={toggle}
          candidateItems={candidateItems}
          notice={extractionNotice}
          onSave={async () => {
            const selectedCandidates = candidateItems.filter((candidate) =>
              selected.has(candidate.id),
            );
            if (!isSupabaseConfigured) {
              setSaved(
                (old) =>
                  new Set([
                    ...old,
                    ...selectedCandidates.map((candidate) => candidate.word),
                  ]),
              );
              return;
            }
            if (!selectedChapter) throw new Error('SELECT_CHAPTER_REQUIRED');
            await saveBackendVocabularyEntries({
              chapterId: selectedChapter.id,
              entries: selectedCandidates,
              candidateIds: selectedCandidates.map((candidate) => candidate.id),
            });
            await refreshVocabulary();
          }}
        />
      );
    if (view === 'prepare')
      return (
        <Prepare go={go} selected={selected} candidateItems={candidateItems} />
      );
    if (view === 'reader')
      return selectedBook && selectedChapter ? (
        <Reader
          go={go}
          saved={saved}
          onSaveWord={saveWord}
          vocabularyEntries={vocabularyEntries}
          book={selectedBook}
          chapter={selectedChapter}
          candidateItems={candidateItems}
        />
      ) : selectedBook ? (
        <BookDetail
          book={selectedBook}
          go={go}
          selectChapter={openChapter}
          onDeleteBook={removeBook}
          onDeleteChapter={removeChapter}
          onEditBook={editBook}
          onEditChapter={editChapter}
        />
      ) : (
        <Library
          go={go}
          books={books}
          selectBook={setSelectedBook}
          userLabel={userLabel}
        />
      );
    return (
      <Vocabulary
        go={go}
        saved={saved}
        entries={vocabularyEntries}
        onRemove={removeVocabularyWord}
        candidateItems={candidateItems}
      />
    );
  }, [
    view,
    books,
    selectedBook,
    selectedChapter,
    selected,
    saved,
    userLabel,
    candidateItems,
    extractionNotice,
    authReady,
    theme,
  ]);
  return (
    <VocabularyCountContext.Provider value={saved.size}>
      {page}
    </VocabularyCountContext.Provider>
  );
}
createRoot(document.getElementById('root')!).render(<App />);
