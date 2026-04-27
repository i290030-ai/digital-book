import { Chapter, ImageLayout } from '../types';
import './Slide.css';

interface SlideProps {
  chapter: Chapter;
  layout: ImageLayout;
  chapterIndex: number;
  totalChapters: number;
}

export function Slide({ chapter, layout, chapterIndex, totalChapters }: SlideProps) {
  const hasImage = Boolean(chapter.image);
  const effectiveLayout = hasImage ? layout : 'top';

  const figureEl = hasImage ? (
    <figure className={`slide__figure slide__figure--${effectiveLayout}`}>
      <img
        src={chapter.image}
        alt={chapter.imageAlt ?? ''}
        className="slide__image"
        loading="lazy"
      />
      {chapter.imageCaption && (
        <figcaption className="slide__caption">{chapter.imageCaption}</figcaption>
      )}
    </figure>
  ) : null;

  const bodyEl = (
    <div className="slide__body">
      {chapter.body.split('\n\n').map((para, i) => (
        <p key={i} className="slide__paragraph">{para}</p>
      ))}
    </div>
  );

  return (
    <article className={`slide slide--${effectiveLayout}`}>

      {/* ── Full-width header ── */}
      <header className="slide__header">
        <div className="slide__header-inner">
          <span className="slide__chapter-label">
            פרק {chapterIndex + 1} מתוך {totalChapters}
          </span>
          <h1 className="slide__title">{chapter.title}</h1>
          {chapter.subtitle && (
            <h2 className="slide__subtitle">{chapter.subtitle}</h2>
          )}
          <div className="slide__divider" />
        </div>
      </header>

      {/* ── Content: image + body ── */}
      <div className={`slide__content slide__content--${effectiveLayout}`}>

        {/* Image: top / right / background — comes first (visually above/right) */}
        {(effectiveLayout === 'top' || effectiveLayout === 'right' || effectiveLayout === 'background') && figureEl}

        {/* Text */}
        <div className="slide__text">
          {bodyEl}
        </div>

        {/* Image: bottom / left — comes after text */}
        {(effectiveLayout === 'bottom' || effectiveLayout === 'left') && figureEl}

      </div>
    </article>
  );
}
