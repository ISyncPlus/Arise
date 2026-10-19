import { useEffect, useRef, useState } from 'react';
import type { PointerEvent } from 'react';
import { fleet } from '../lib/data';
import type { FlightScene } from '../scene/FlightScene';
import { LoopVideo } from './LoopVideo';
import type { Interest } from '../App';

type Props = { reduced: boolean; onHover: () => void; onInterest: (value: Interest) => void };
const clamp = (n: number, min: number, max: number) => Math.min(max, Math.max(min, n));

function FleetDialog({ index, reduced, onClose, onInterest }: { index: number | null; reduced: boolean; onClose: () => void; onInterest: (value: Interest) => void }) {
  const dialog = useRef<HTMLDialogElement>(null);
  const viewer = useRef<HTMLDivElement>(null);
  const item = index === null ? null : fleet[index];
  useEffect(() => {
    if (item && dialog.current && !dialog.current.open) dialog.current.showModal();
    else if (!item && dialog.current?.open) dialog.current.close();
  }, [item]);
  useEffect(() => {
    if (!item || !viewer.current) return;
    let cancelled = false, scene: FlightScene | undefined;
    void import('../scene/FlightScene').then(({ FlightScene }) => {
      if (cancelled || !viewer.current) return;
      scene = new FlightScene(viewer.current, { mode: 'detail', model: item.model, finish: item });
      scene.setReduced(true);
    }).catch(error => console.error('Aircraft preview unavailable', error));
    return () => { cancelled = true; scene?.dispose(); };
  }, [item]);
  return <dialog ref={dialog} className="fleet-dialog" onClose={onClose} onClick={event => { if (event.target === dialog.current) dialog.current?.close(); }} aria-label={item ? `ARISE ${item.name} details` : 'Aircraft details'}>
    {item && <div className="dialog-inner">
      <button type="button" className="dialog-close mono" aria-label="Close aircraft details" onClick={() => dialog.current?.close()}>Close ×</button>
      <div className="dialog-media"><LoopVideo media={item.media} label={`ARISE ${item.name} in flight`} active reduced={reduced} /><div className="dialog-viewer" ref={viewer} aria-label={`Three-dimensional ARISE ${item.name} model`} /></div>
      <div className="dialog-copy"><p className="eyebrow">ARISE aircraft · 0{index! + 1}</p><h2>{item.name}</h2><p className="mono dialog-finish">{item.finish}</p><p>{item.line}</p><a className="pill" href="#contact" onClick={() => { onInterest('Charter'); dialog.current?.close(); }}>Ask about this aircraft <span aria-hidden="true">↗</span></a></div>
    </div>}
  </dialog>;
}

export function Aircraft({ reduced, onHover, onInterest }: Props) {
  const section = useRef<HTMLElement>(null);
  const cards = useRef<(HTMLButtonElement | null)[]>([]);
  const meter = useRef<HTMLSpanElement>(null);
  const [active, setActive] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  useEffect(() => {
    let frame = 0, cardHeight = cards.current[0]?.offsetHeight || 500, previous = -1;
    const paint = () => {
      frame = 0;
      const node = section.current;
      if (!node) return;
      const rect = node.getBoundingClientRect();
      const progress = clamp(-rect.top / Math.max(1, rect.height - window.innerHeight) * 4, 0, 4);
      if (progress === previous) return;
      previous = progress;
      cards.current.forEach((card, i) => {
        if (!card) return;
        const distance = Math.abs(i - progress);
        card.style.transform = `translate3d(0, ${(i - progress) * cardHeight * .78}px, 0) scale(${1 - Math.min(distance, 1.6) * .2})`;
        card.style.setProperty('--dim', String(Math.min(distance, 1) * .62));
        card.style.zIndex = String(10 - Math.round(distance));
        card.style.willChange = distance < 1.8 ? 'transform' : 'auto';
        card.style.pointerEvents = distance < 1.5 ? 'auto' : 'none';
      });
      if (meter.current) meter.current.style.transform = `scaleY(${progress / 4})`;
      const index = Math.round(progress);
      setActive(current => current === index ? current : index);
    };
    const update = () => { if (!frame) frame = requestAnimationFrame(paint); };
    const measure = () => { cardHeight = cards.current[0]?.offsetHeight || 500; previous = -1; update(); };
    const observer = new ResizeObserver(measure);
    if (cards.current[0]) observer.observe(cards.current[0]);
    update(); window.addEventListener('scroll', update, { passive: true }); window.addEventListener('resize', measure);
    return () => { observer.disconnect(); cancelAnimationFrame(frame); window.removeEventListener('scroll', update); window.removeEventListener('resize', measure); };
  }, []);
  const pointer = (event: PointerEvent<HTMLButtonElement>) => {
    if (reduced || event.pointerType === 'touch') return;
    const rect = event.currentTarget.getBoundingClientRect();
    const x = (event.clientX - rect.left) / rect.width, y = (event.clientY - rect.top) / rect.height;
    event.currentTarget.style.setProperty('--tilt-x', `${(y - .5) * -8}deg`);
    event.currentTarget.style.setProperty('--tilt-y', `${(x - .5) * 10}deg`);
    event.currentTarget.style.setProperty('--mx', `${x * 100}%`);
    event.currentTarget.style.setProperty('--my', `${y * 100}%`);
  };
  return <section id="aircraft" ref={section} className="aircraft-section" aria-labelledby="aircraft-title">
    <div className="aircraft-stage">
      <div className="aircraft-heading">
        <p className="eyebrow">01 / The fleet</p>
        <h2 id="aircraft-title">Five aircraft,<br /><em>one way of flying.</em></h2>
        <div className="fleet-meter"><span className="fleet-counter">0{active + 1} <small>/ 05</small></span><div className="meter-track"><span ref={meter} style={{ height: '100%', transformOrigin: 'top' }} /></div></div>
      </div>
      <div className="fleet-reel" aria-label="Five ARISE aircraft">
        {fleet.map((item, i) => <button ref={node => { cards.current[i] = node; }} type="button" key={item.name} className="fleet-card" tabIndex={Math.abs(i - active) <= 1 ? 0 : -1} onClick={() => setSelected(i)} onPointerMove={pointer} onPointerEnter={onHover} onPointerLeave={event => { event.currentTarget.style.setProperty('--tilt-x', '0deg'); event.currentTarget.style.setProperty('--tilt-y', '0deg'); }}>
          <span className="fleet-card-inner"><LoopVideo media={item.media} label={`ARISE ${item.name}, ${item.finish}`} active={Math.abs(i - active) <= 1} reduced={reduced} /><span className="fleet-card-shade" /><span className="fleet-card-label mono">ARISE {item.name}<span aria-hidden="true">↗</span></span><span className="fleet-card-dim" /></span>
        </button>)}
      </div>
      <div className="fleet-details" aria-live="polite">
        <div key={active} className="fleet-details-animated">
          <p className="eyebrow">Aircraft / 0{active + 1}</p>
          <h3><span>{fleet[active].name}</span></h3>
          <p className="mono fleet-finish"><span>{fleet[active].finish}</span></p>
          <p className="fleet-description"><span>{fleet[active].line}</span></p>
          <button className="text-link" type="button" onClick={() => setSelected(active)}>Explore aircraft <span aria-hidden="true">↗</span></button>
        </div>
      </div>
    </div>
    <FleetDialog index={selected} reduced={reduced} onClose={() => setSelected(null)} onInterest={onInterest} />
  </section>;
}
