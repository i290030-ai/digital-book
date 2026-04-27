import { useState } from 'react';
import { BookReader } from './components/BookReader';
import { FlipBookReader } from './components/FlipBookReader';

export default function App() {
  const [mode, setMode] = useState<'slider' | 'flip'>('flip');

  return (
    <>
      {/* Toggle — top-left, small, unobtrusive */}
      <div style={{
        position: 'fixed', top: 6, left: 8, zIndex: 999,
        display: 'flex', gap: 4,
      }}>
        <button
          onClick={() => setMode('slider')}
          style={{
            fontSize: 11, padding: '2px 8px', borderRadius: 5, cursor: 'pointer',
            background: mode === 'slider' ? '#4f46e5' : '#e5e3df',
            color: mode === 'slider' ? '#fff' : '#555', border: 'none',
          }}
        >
          slider
        </button>
        <button
          onClick={() => setMode('flip')}
          style={{
            fontSize: 11, padding: '2px 8px', borderRadius: 5, cursor: 'pointer',
            background: mode === 'flip' ? '#4f46e5' : '#e5e3df',
            color: mode === 'flip' ? '#fff' : '#555', border: 'none',
          }}
        >
          flip
        </button>
      </div>

      {mode === 'flip' ? <FlipBookReader /> : <BookReader />}
    </>
  );
}
