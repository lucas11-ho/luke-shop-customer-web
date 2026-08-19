import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Icon } from './icons.jsx';

function clamp(value, min, max) { return Math.min(max, Math.max(min, value)); }
function isImage(item) { return String(item?.media_type || 'IMAGE').toUpperCase() !== 'VIDEO'; }

export function ProductMediaViewer({ media = [], productName = 'Product', openIndex = -1, onClose }) {
  const images = useMemo(() => media.filter(isImage), [media]);
  const [index, setIndex] = useState(0);
  const [scale, setScale] = useState(1);
  const pointers = useRef(new Map());
  const pinchStart = useRef(null);

  useEffect(() => {
    if (openIndex < 0) return;
    const target = media[openIndex];
    const imageIndex = Math.max(0, images.findIndex((item) => item.public_id === target?.public_id));
    setIndex(imageIndex);
    setScale(1);
  }, [openIndex, media, images]);

  useEffect(() => {
    if (openIndex < 0) return undefined;
    const onKey = (event) => {
      if (event.key === 'Escape') onClose?.();
      if (event.key === 'ArrowRight') { setIndex((value) => (value + 1) % Math.max(1, images.length)); setScale(1); }
      if (event.key === 'ArrowLeft') { setIndex((value) => (value - 1 + images.length) % Math.max(1, images.length)); setScale(1); }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [openIndex, images.length, onClose]);

  if (openIndex < 0 || !images.length) return null;
  const item = images[index];
  const previous = () => { setIndex((value) => (value - 1 + images.length) % images.length); setScale(1); };
  const next = () => { setIndex((value) => (value + 1) % images.length); setScale(1); };

  const pointerDown = (event) => {
    event.currentTarget.setPointerCapture?.(event.pointerId);
    pointers.current.set(event.pointerId, { x: event.clientX, y: event.clientY });
    if (pointers.current.size === 2) {
      const [a, b] = [...pointers.current.values()];
      pinchStart.current = { distance: Math.hypot(a.x - b.x, a.y - b.y), scale };
    }
  };
  const pointerMove = (event) => {
    if (!pointers.current.has(event.pointerId)) return;
    pointers.current.set(event.pointerId, { x: event.clientX, y: event.clientY });
    if (pointers.current.size === 2 && pinchStart.current) {
      const [a, b] = [...pointers.current.values()];
      const distance = Math.hypot(a.x - b.x, a.y - b.y);
      setScale(clamp(pinchStart.current.scale * (distance / Math.max(1, pinchStart.current.distance)), 1, 4));
    }
  };
  const pointerUp = (event) => {
    pointers.current.delete(event.pointerId);
    if (pointers.current.size < 2) pinchStart.current = null;
  };

  return (
    <div className="product-media-viewer" role="dialog" aria-modal="true" aria-label={`${productName} image viewer`} onMouseDown={(event) => event.target === event.currentTarget && onClose?.()}>
      <div className="product-media-viewer-toolbar">
        <span>{index + 1} / {images.length}</span>
        <div>
          <button type="button" onClick={() => setScale((value) => clamp(value - .5, 1, 4))} aria-label="Zoom out"><Icon name="minus" size={19} /></button>
          <button type="button" onClick={() => setScale(1)} aria-label="Reset zoom">100%</button>
          <button type="button" onClick={() => setScale((value) => clamp(value + .5, 1, 4))} aria-label="Zoom in"><Icon name="plus" size={19} /></button>
          <button type="button" onClick={onClose} aria-label="Close image viewer"><Icon name="x" size={21} /></button>
        </div>
      </div>
      <div className="product-media-viewer-stage" onPointerDown={pointerDown} onPointerMove={pointerMove} onPointerUp={pointerUp} onPointerCancel={pointerUp} onDoubleClick={() => setScale((value) => value > 1 ? 1 : 2)}>
        <img src={item.url} alt={item.alt_text || productName} draggable="false" style={{ transform: `scale(${scale})` }} />
      </div>
      {images.length > 1 && <>
        <button type="button" className="product-media-viewer-nav prev" onClick={previous} aria-label="Previous image"><Icon name="chevron-right" size={24} className="flip" /></button>
        <button type="button" className="product-media-viewer-nav next" onClick={next} aria-label="Next image"><Icon name="chevron-right" size={24} /></button>
      </>}
      <p className="product-media-viewer-help">Pinch or double-tap to zoom. Swipe through the gallery with the arrows.</p>
    </div>
  );
}
