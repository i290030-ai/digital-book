import { useState, useCallback, useEffect } from 'react';
import chaptersData from '../data/chapters.json';
import './FlipBookReader.css';

const chapters = chaptersData;

// ─── FlipBookReader — CSS-animated page flip, no react-pageflip ──────────────
export function FlipBookReader() {
  const [currentPage, setCurrentPage] = useState(0);
  const [flipDir, setFlipDir] = useState('next'); // 'next' | 'prev'

  const progress = ((currentPage + 1) / chapters.length) * 100;

  const goNext = useCallback(() => {
    if (currentPage >= chapters.length - 1) return;
    setFlipDir('next');
    setCurrentPage(p => p + 1);
  }, [currentPage]);

  const goPrev = useCallback(() => {
    if (currentPage <= 0) return;
    setFlipDir('prev');
    setCurrentPage(p => p - 1);
  }, [currentPage]);

  const goTo = useCallback((i, current) => {
    setFlipDir(i > current ? 'next' : 'prev');
    setCurrentPage(i);
  }, []);

  useEffect(() => {
    const onKey = (e) => {
      if (e.key === 'ArrowRight') goNext();
      if (e.key === 'ArrowLeft')  goPrev();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [goNext, goPrev]);

  const chapter = chapters[currentPage];
  const images = chapter.images ?? (chapter.image ? [chapter.image] : []);

  return (
    <div className="fp-reader" dir="ltr">

      {/* Progress */}
      <div className="fp-reader__progress">
        <div className="fp-reader__progress-fill" style={{ width: `${progress}%` }} />
      </div>

      {/* Book area */}
      <div className="fp-reader__wrap">
        <div
          key={currentPage}
          className={`fp-stage fp-stage--${flipDir}`}
        >
          <div className="fp-page__scroll" dir="rtl">

            <header className="fp-page__header">
              <span className="fp-page__label">פרק {currentPage + 1} מתוך {chapters.length}</span>
              <h1 className="fp-page__title">{chapter.title}</h1>
              {chapter.subtitle && (
                <h2 className="fp-page__subtitle">{chapter.subtitle}</h2>
              )}
              <div className="fp-page__divider" />
            </header>

            {images.length > 0 && (
              <div className="fp-page__images">
                {images.map((src, i) => (
                  <img
                    key={i}
                    src={src}
                    alt={chapter.imageAlt ?? ''}
                    className="fp-page__image"
                    loading="lazy"
                    draggable={false}
                  />
                ))}
              </div>
            )}

            <div className="fp-page__body">
              {chapter.body.split('\n\n').map((para, i) => (
                <p key={i} className="fp-page__paragraph">{para}</p>
              ))}
            </div>

            <footer className="fp-page__footer">{currentPage + 1} / {chapters.length}</footer>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="fp-reader__nav" dir="ltr">
        <button
          className="fp-btn"
          onClick={goPrev}
          disabled={currentPage === 0}
          aria-label="פרק קודם"
        >
          ← קודם
        </button>

        <ol className="fp-dots">
          {chapters.map((ch, i) => (
            <li key={ch.id}>
              <button
                className={`fp-dot${i === currentPage ? ' fp-dot--active' : ''}`}
                onClick={() => goTo(i, currentPage)}
                aria-label={`פרק ${i + 1}`}
              />
            </li>
          ))}
        </ol>

        <button
          className="fp-btn"
          onClick={goNext}
          disabled={currentPage === chapters.length - 1}
          aria-label="פרק הבא"
        >
          הבא →
        </button>
      </nav>
    </div>
  );
}
