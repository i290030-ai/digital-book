import { useState, useCallback, useEffect } from 'react';
import chaptersData from '../data/chapters.json';
import './FlipBookReader.css';

const chapters = chaptersData;
const FLIP_MS = 480;

const LAYOUTS = ['imageTop', 'imageFloatRight', 'imageBottom', 'imageFloatLeft', 'imageRight', 'imageLeft'];

// ─── FlipBookReader — CSS-animated page flip, no react-pageflip ──────────────
export function FlipBookReader() {
  const [currentPage, setCurrentPage] = useState(0);
  const [flipDir, setFlipDir] = useState(null);     // 'next' | 'prev' | null
  const [isAnimating, setIsAnimating] = useState(false);

  const progress = ((currentPage + 1) / chapters.length) * 100;

  const goToPage = useCallback((targetIndex) => {
    if (isAnimating) return;
    if (targetIndex < 0 || targetIndex >= chapters.length) return;
    if (targetIndex === currentPage) return;

    const direction = targetIndex < currentPage ? 'prev' : 'next';
    setIsAnimating(true);
    setFlipDir(direction);

    setTimeout(() => {
      setCurrentPage(targetIndex);
      setIsAnimating(false);
      setFlipDir(null);
    }, FLIP_MS);
  }, [currentPage, isAnimating]);

  useEffect(() => {
    const onKey = (e) => {
      if (e.key === 'ArrowRight') goToPage(currentPage + 1);
      if (e.key === 'ArrowLeft')  goToPage(currentPage - 1);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [goToPage, currentPage]);

  const chapter = chapters[currentPage];
  const images = chapter.images ?? (chapter.image ? [chapter.image] : []);
  const layout = images.length > 0 ? LAYOUTS[currentPage % LAYOUTS.length] : 'imageTop';
  const isGallery = images.length > 1;
  const isFloat = !isGallery && (layout === 'imageFloatRight' || layout === 'imageFloatLeft');
  const isRow   = !isGallery && (layout === 'imageRight'      || layout === 'imageLeft');

  const paragraphs = chapter.body.split('\n\n').map((para, i) => (
    <p key={i} className="fp-page__paragraph">{para}</p>
  ));

  const singleImg = (cls = '') => (
    <img
      src={images[0]}
      alt={chapter.imageAlt ?? ''}
      className={`fp-page__image ${cls}`.trim()}
      loading="lazy"
      draggable={false}
    />
  );

  const gallery = (
    <div className="fp-page__gallery">
      {images.map((src, i) => (
        <img key={i} src={src} alt={chapter.imageAlt ?? ''} className="fp-page__image" loading="lazy" draggable={false} />
      ))}
    </div>
  );

  const renderBody = () => {
    if (isGallery) return (
      <>{gallery}<div className="fp-page__body">{paragraphs}</div></>
    );
    if (isFloat) return (
      <div className="fp-page__body fp-page__body--float">
        {singleImg(layout === 'imageFloatRight' ? 'fp-float-right' : 'fp-float-left')}
        {paragraphs}
      </div>
    );
    if (isRow) return (
      <div className="fp-page__row">
        {layout === 'imageLeft' && <div className="fp-page__images fp-page__images--side">{singleImg()}</div>}
        <div className="fp-page__body">{paragraphs}</div>
        {layout === 'imageRight' && <div className="fp-page__images fp-page__images--side">{singleImg()}</div>}
      </div>
    );
    if (layout === 'imageBottom') return (
      <><div className="fp-page__body">{paragraphs}</div><div className="fp-page__images">{singleImg()}</div></>
    );
    // imageTop (default)
    return (
      <><div className="fp-page__images">{singleImg()}</div><div className="fp-page__body">{paragraphs}</div></>
    );
  };

  return (
    <div className="fp-reader" dir="ltr">

      {/* Progress */}
      <div className="fp-reader__progress">
        <div className="fp-reader__progress-fill" style={{ width: `${progress}%` }} />
      </div>

      {/* Book area — stage stays mounted, key on inner content only */}
      <div className="fp-reader__wrap">
        <div className={`fp-stage${flipDir ? ` fp-stage--${flipDir}` : ''}`}>
          <div key={currentPage} className="fp-page__scroll" dir="rtl">

            <header className="fp-page__header">
              <span className="fp-page__label">פרק {currentPage + 1} מתוך {chapters.length}</span>
              <h1 className="fp-page__title">{chapter.title}</h1>
              {chapter.subtitle && (
                <h2 className="fp-page__subtitle">{chapter.subtitle}</h2>
              )}
              <div className="fp-page__divider" />
            </header>

            {renderBody()}

            <footer className="fp-page__footer">{currentPage + 1} / {chapters.length}</footer>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="fp-reader__nav" dir="ltr">
        <button
          className="fp-btn"
          onClick={() => goToPage(currentPage - 1)}
          disabled={currentPage === 0 || isAnimating}
          aria-label="פרק קודם"
        >
          ← קודם
        </button>

        <ol className="fp-dots">
          {chapters.map((ch, i) => (
            <li key={ch.id}>
              <button
                className={`fp-dot${i === currentPage ? ' fp-dot--active' : ''}`}
                onClick={() => goToPage(i)}
                aria-label={`פרק ${i + 1}`}
              />
            </li>
          ))}
        </ol>

        <button
          className="fp-btn"
          onClick={() => goToPage(currentPage + 1)}
          disabled={currentPage === chapters.length - 1 || isAnimating}
          aria-label="פרק הבא"
        >
          הבא →
        </button>
      </nav>
    </div>
  );
}
