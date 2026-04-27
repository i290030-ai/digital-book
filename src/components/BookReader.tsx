import { useState, useEffect, useCallback, useRef } from 'react';
import { Chapter } from '../types';
import chaptersData from '../data/chapters.json';
import './BookReader.css';

const chapters = chaptersData as Chapter[];

export function BookReader() {
  const [currentPage, setCurrentPage] = useState(0);
  const [direction, setDirection] = useState<'next' | 'prev'>('next');
  const touchStartX = useRef<number | null>(null);
  const touchStartY = useRef<number | null>(null);

  const navigateTo = useCallback((index: number, dir: 'next' | 'prev') => {
    if (index < 0 || index >= chapters.length) return;
    setDirection(dir);
    setCurrentPage(index);
    window.scrollTo({ top: 0 });
  }, []);

  const goNext = useCallback(() => navigateTo(currentPage + 1, 'next'), [currentPage, navigateTo]);
  const goPrev = useCallback(() => navigateTo(currentPage - 1, 'prev'), [currentPage, navigateTo]);
  const goTo   = useCallback((i: number) => navigateTo(i, i > currentPage ? 'next' : 'prev'), [currentPage, navigateTo]);

  // Keyboard
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft')  goNext();
      if (e.key === 'ArrowRight') goPrev();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [goNext, goPrev]);

  // Swipe
  const onTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
    touchStartY.current = e.touches[0].clientY;
  };
  const onTouchEnd = (e: React.TouchEvent) => {
    if (touchStartX.current === null || touchStartY.current === null) return;
    const dx = e.changedTouches[0].clientX - touchStartX.current;
    const dy = e.changedTouches[0].clientY - touchStartY.current;
    if (Math.abs(dx) > Math.abs(dy) && Math.abs(dx) > 40) {
      dx > 0 ? goPrev() : goNext();
    }
    touchStartX.current = null;
    touchStartY.current = null;
  };

  const chapter = chapters[currentPage];
  const progress = ((currentPage + 1) / chapters.length) * 100;

  return (
    <div className="reader" dir="rtl" onTouchStart={onTouchStart} onTouchEnd={onTouchEnd}>

      {/* Progress */}
      <div className="reader__progress" role="progressbar" aria-valuenow={currentPage + 1} aria-valuemax={chapters.length}>
        <div className="reader__progress-fill" style={{ width: `${progress}%` }} />
      </div>

      {/* Slide — key remount triggers CSS animation */}
      <main
        className={`reader__stage reader__stage--${direction}`}
        key={currentPage}
      >
        <ChapterPage chapter={chapter} index={currentPage} total={chapters.length} />
      </main>

      {/* Navigation */}
      <nav className="reader__nav" aria-label="ניווט בין פרקים">
        <button
          className="reader__btn"
          onClick={goPrev}
          disabled={currentPage === 0}
          aria-label="פרק קודם"
        >
          <ChevronIcon direction="right" />
          <span>קודם</span>
        </button>

        <ol className="reader__dots" aria-label="רשימת פרקים">
          {chapters.map((ch, i) => (
            <li key={ch.id}>
              <button
                className={`reader__dot${i === currentPage ? ' reader__dot--active' : ''}`}
                onClick={() => goTo(i)}
                aria-label={`פרק ${i + 1}`}
                aria-current={i === currentPage ? 'page' : undefined}
              />
            </li>
          ))}
        </ol>

        <button
          className="reader__btn"
          onClick={goNext}
          disabled={currentPage === chapters.length - 1}
          aria-label="פרק הבא"
        >
          <span>הבא</span>
          <ChevronIcon direction="left" />
        </button>
      </nav>
    </div>
  );
}

// ─── Chapter page — all content from one chapter object ──────────────────────
function ChapterPage({ chapter, index, total }: { chapter: Chapter; index: number; total: number }) {
  return (
    <article className="chapter-page" dir="rtl">
      <div className="chapter-page__scroll">

        <header className="chapter-page__header">
          <span className="chapter-page__label">פרק {index + 1} מתוך {total}</span>
          <h1 className="chapter-page__title">{chapter.title}</h1>
          {chapter.subtitle && (
            <h2 className="chapter-page__subtitle">{chapter.subtitle}</h2>
          )}
          <div className="chapter-page__divider" />
        </header>

        {(chapter.images ?? (chapter.image ? [chapter.image] : [])).length > 0 && (
          <figure className={`chapter-page__figure${(chapter.images ?? []).length > 1 ? ' chapter-page__figure--duo' : ''}`}>
            {(chapter.images ?? (chapter.image ? [chapter.image] : [])).map((src, i) => (
              <img
                key={i}
                src={src}
                alt={chapter.imageAlt ?? ''}
                className="chapter-page__image"
                loading="lazy"
                draggable={false}
              />
            ))}
            {chapter.imageCaption && (
              <figcaption className="chapter-page__caption">{chapter.imageCaption}</figcaption>
            )}
          </figure>
        )}

        <div className="chapter-page__body">
          {chapter.body.split('\n\n').map((para, i) => (
            <p key={i} className="chapter-page__paragraph">{para}</p>
          ))}
        </div>

        <footer className="chapter-page__footer">{index + 1} / {total}</footer>
      </div>
    </article>
  );
}

function ChevronIcon({ direction }: { direction: 'left' | 'right' }) {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none"
      strokeWidth="2.2" stroke="currentColor"
      strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      {direction === 'left'
        ? <polyline points="15 18 9 12 15 6" />
        : <polyline points="9 18 15 12 9 6" />}
    </svg>
  );
}
