import { useEffect, useRef, useState } from 'react';
import type { CSSProperties, TouchEvent } from 'react';
import { ownership } from '../lib/data';
import { LoopVideo } from './LoopVideo';
import type { Interest } from '../App';

type Props = { reduced: boolean; onInterest: (value: Interest) => void };

export function Ownership({ reduced, onInterest }: Props) {
  const section = useRef<HTMLElement>(null);
  const startX = useRef<number | null>(null);
  const [active, setActive] = useState(0);
  const [width, setWidth] = useState(260);
  const shift = (step: number) => setActive(i => (i + step + ownership.length) % ownership.length);
  useEffect(() => {
    const resize = () => setWidth(Math.min(window.innerWidth < 700 ? window.innerWidth * .53 : 300, 300));
    resize(); window.addEventListener('resize', resize);
    return () => window.removeEventListener('resize', resize);
  }, []);
  useEffect(() => {
    const key = (event: KeyboardEvent) => {
      if (!['ArrowLeft', 'ArrowRight'].includes(event.key)) return;
      const rect = section.current?.getBoundingClientRect();
      if (!rect || rect.top > window.innerHeight * .75 || rect.bottom < window.innerHeight * .25) return;
      if (/INPUT|TEXTAREA|SELECT/.test((event.target as HTMLElement)?.tagName)) return;
      event.preventDefault(); shift(event.key === 'ArrowRight' ? 1 : -1);
    };
    window.addEventListener('keydown', key);
    return () => window.removeEventListener('keydown', key);
  }, []);
  const touchStart = (event: TouchEvent) => { startX.current = event.touches[0]?.clientX ?? null; };
  const touchEnd = (event: TouchEvent) => {
    if (startX.current === null) return;
    const dx = startX.current - (event.changedTouches[0]?.clientX ?? startX.current);
    startX.current = null;
    if (Math.abs(dx) >= 40) shift(Math.sign(dx));
  };
  return <section id="ownership" ref={section} className="ownership-section" aria-labelledby="ownership-title">
    <div className="ownership-copy">
      <p className="eyebrow">03 / Ownership</p>
      <h2 id="ownership-title" key={active}>{ownership[active].line}</h2>
      <p className="ownership-description">However you choose to fly, ownership should feel as effortless as the journey. We shape the aircraft and the arrangement around you.</p>
      <a className="pill" href="#contact" onClick={() => onInterest('Ownership')}>Discuss Ownership <span aria-hidden="true">↗</span></a>
      <div className="ownership-controls">
        <button type="button" aria-label="Previous ownership option" onClick={() => shift(-1)}>←</button>
        <span className="mono">0{active + 1} / 05</span>
        <button type="button" aria-label="Next ownership option" onClick={() => shift(1)}>→</button>
      </div>
    </div>
    <div className="ownership-arc" onTouchStart={touchStart} onTouchEnd={touchEnd} aria-label="Ownership options">
      {ownership.map((item, i) => {
        let d = i - active;
        if (d > 2) d -= ownership.length;
        if (d < -2) d += ownership.length;
        const distance = Math.abs(d);
        const style: CSSProperties = {
          transform: `translateX(${d * width * .78}px) translateY(${Math.pow(distance, 1.25) * 34}px) translateZ(${-distance * 170}px) rotateY(${-24 * d}deg) rotateZ(${3 * d}deg) scale(${d === 0 ? 1 : .82})`,
          opacity: distance === 0 ? 1 : distance === 1 ? .55 : 0,
          zIndex: 5 - distance,
          pointerEvents: distance > 1 ? 'none' : 'auto',
        };
        return <button key={item.title} type="button" className="ownership-card" style={style} tabIndex={distance <= 1 ? 0 : -1} aria-hidden={distance > 1} aria-label={`View ${item.title}`} aria-current={d === 0 ? 'true' : undefined} onClick={() => setActive(i)}>
          <LoopVideo media={item.media} label={item.title} active={distance <= 1} reduced={reduced} />
          <span className="ownership-card-shade" />
          <span className="ownership-card-label mono">0{i + 1} / {item.title}</span>
        </button>;
      })}
    </div>
    <p className="ownership-swipe mono">Swipe or use arrows to explore</p>
  </section>;
}
