import React, { useState, useRef, useLayoutEffect, useCallback, useEffect } from 'react';
import HTMLFlipBook from 'react-pageflip';
import chaptersData from '../data/chapters.json';
import './FlipBookReader.css';

const chapters = chaptersData;

// ─── Single page — LTR wrapper, RTL text content ─────────────────────────────
const Page = React.forwardRef(function Page({ chapter, index, total }, ref) {
  const images = chapter.images ?? (chapter.image ? [chapter.image] : []);

  return (
    // outer div: LTR (required for react-pageflip orientation)
    <div ref={ref} className="fp-page">
      {/* inner scroll: RTL for Hebrew content */}
      <div className="fp-page__scroll" dir="rtl">

        <header className="fp-page__header">
          <span className="fp-page__label">פרק {index + 1} מתוך {total}</span>
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

        <footer className="fp-page__footer">{index + 1} / {total}</footer>
      </div>
    </div>
  );
});

// ─── FlipBookReader ───────────────────────────────────────────────────────────
export function FlipBookReader() {
  const [currentPage, setCurrentPage] = useState(0);
  const bookRef = useRef(null);
  const wrapRef = useRef(null);
  const [dims, setDims] = useState({ width: 500, height: 680 });

  useLayoutEffect(() => {
    const compute = () => {
      if (!wrapRef.current) return;
      const { width, height } = wrapRef.current.getBoundingClientRect();
      setDims({
        width:  Math.floor(Math.min(width  - 4, 700)),
        height: Math.floor(Math.max(height - 4, 400)),
      });
    };
    compute();
    const ro = new ResizeObserver(compute);
    if (wrapRef.current) ro.observe(wrapRef.current);
    return () => ro.disconnect();
  }, []);

  const progress = ((currentPage + 1) / chapters.length) * 100;

  // ── Navigation ──
  const goNext = useCallback(() => {
    bookRef.current?.pageFlip()?.flipNext();
  }, []);

  const goPrev = useCallback(() => {
    bookRef.current?.pageFlip()?.flipPrev();
  }, []);

  const goTo = useCallback((i) => {
    bookRef.current?.pageFlip()?.flip(i);
  }, []);

  useEffect(() => {
    const onKey = (e) => {
      if (e.key === 'ArrowRight') goNext();   // LTR: right = forward
      if (e.key === 'ArrowLeft')  goPrev();   // LTR: left  = back
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [goNext, goPrev]);

  const onFlip = useCallback((e) => {
    setCurrentPage(e.data);
  }, []);

  return (
    // Book container: LTR so react-pageflip orientation is correct
    <div className="fp-reader" dir="ltr">

      {/* Progress */}
      <div className="fp-reader__progress">
        <div className="fp-reader__progress-fill" style={{ width: `${progress}%` }} />
      </div>

      {/* Flip book */}
      <div className="fp-reader__wrap" ref={wrapRef}>
        <HTMLFlipBook
          ref={bookRef}
          width={dims.width}
          height={dims.height}
          size="fixed"
          minWidth={280}
          maxWidth={700}
          minHeight={400}
          maxHeight={1100}
          drawShadow={true}
          flippingTime={700}
          usePortrait={true}
          startZIndex={1}
          autoSize={false}
          maxShadowOpacity={0.4}
          showCover={false}
          mobileScrollSupport={true}
          clickEventForward={true}
          useMouseEvents={true}
          swipeDistance={40}
          showPageCorners={true}
          disableFlipByClick={true}
          startPage={0}
          className="fp-flipbook"
          style={{ margin: '0 auto' }}
          onFlip={onFlip}
        >
          {chapters.map((ch, i) => (
            <Page key={ch.id} chapter={ch} index={i} total={chapters.length} />
          ))}
        </HTMLFlipBook>
      </div>

      {/* Navigation — LTR layout: prev on left, next on right */}
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
                onClick={() => goTo(i)}
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
