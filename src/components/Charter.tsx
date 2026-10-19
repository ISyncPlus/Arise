import { useEffect, useRef } from 'react';
import { media } from '../lib/assets';
import type { FlightScene } from '../scene/FlightScene';
import { LoopVideo } from './LoopVideo';
import type { Interest } from '../App';

type Props = { reduced: boolean; onInterest: (value: Interest) => void };
const benefits = [
  ['Two-hour confirmation', 'An aircraft, a crew and a route confirmed with purpose.'],
  ['One coordinator', 'One familiar voice from your first call to your arrival.'],
  ['Private terminals', 'An unhurried departure, away from the main concourse.'],
  ['Food from where you leave', 'The city you depart can be part of what comes along.'],
  ['Everyone is welcome', 'Family, colleagues and companions all have their place.'],
] as const;

export function Charter({ reduced, onInterest }: Props) {
  const film = useRef<HTMLDivElement>(null);
  const list = useRef<HTMLDivElement>(null);
  const canvas = useRef<HTMLDivElement>(null);
  const scene = useRef<FlightScene | null>(null);
  const topProgress = useRef(0);
  useEffect(() => {
    const node = canvas.current;
    if (!node) return;
    let cancelled = false;
    const observer = new IntersectionObserver(([entry]) => {
      if (!entry.isIntersecting) return;
      observer.disconnect();
      void import('../scene/FlightScene').then(({ FlightScene }) => {
        if (cancelled || !canvas.current) return;
        scene.current = new FlightScene(canvas.current, { mode: 'top' });
        scene.current.setReduced(true);
        scene.current.setTopProgress(topProgress.current);
      }).catch(error => console.error('Top view unavailable', error));
    }, { rootMargin: '200px' });
    observer.observe(node);
    return () => { cancelled = true; observer.disconnect(); scene.current?.dispose(); scene.current = null; };
  }, []);
  useEffect(() => {
    let frame = 0;
    const paint = () => {
      frame = 0;
      if (film.current) {
        const rect = film.current.getBoundingClientRect();
        if (rect.top < window.innerHeight + 100 && rect.bottom > -100) {
          const p = reduced ? 1 : Math.min(1, Math.max(0, (window.innerHeight - rect.top) / window.innerHeight));
          const parallax = reduced ? 0 : Math.max(-8, Math.min(8, (rect.top + rect.height / 2 - window.innerHeight / 2) / window.innerHeight * -8));
          film.current.style.clipPath = `inset(0 ${9.2 - p * 8}vw round ${28 - p * 18}px)`;
          film.current.style.setProperty('--parallax', `${parallax}%`);
        }
      }
      if (list.current) {
        const rect = list.current.getBoundingClientRect();
        topProgress.current = reduced ? .5 : Math.min(1, Math.max(0, -rect.top / Math.max(1, rect.height - window.innerHeight)));
        scene.current?.setTopProgress(topProgress.current);
      }
    };
    const update = () => { if (!frame) frame = requestAnimationFrame(paint); };
    update(); window.addEventListener('scroll', update, { passive: true }); window.addEventListener('resize', update);
    return () => { cancelAnimationFrame(frame); window.removeEventListener('scroll', update); window.removeEventListener('resize', update); };
  }, [reduced]);
  return <section id="charter" className="charter-section" aria-labelledby="charter-title">
    <div ref={film} className="charter-film" >
      <LoopVideo media={media.charter} label="ARISE jet crossing a clouded sky" active reduced={reduced} className="charter-video" />
      <div className="charter-film-shade" />
      <div className="charter-film-copy">
        <p className="eyebrow">02 / Charter</p>
        <h2 id="charter-title">Charter on<br /><em>your clock.</em></h2>
        <p>Tell us where and when. We confirm an aircraft, a crew and a plan within two hours, day or night.</p>
        <a className="pill" href="#contact" onClick={() => onInterest('Charter')}>Request a Flight <span aria-hidden="true">↗</span></a>
      </div>
    </div>
    <div ref={list} className="charter-benefits">
      <div className="benefit-intro"><p className="eyebrow">The journey, considered</p><h3>All the details<br /><em>take care of themselves.</em></h3><p>We make the time around the flight feel as considered as the flight itself.</p></div>
      <ol>{benefits.map(([title, line], i) => <li key={title}><span className="mono">0{i + 1}</span><div><h4>{title}</h4><p>{line}</p></div><span aria-hidden="true">↗</span></li>)}</ol>
      <div ref={canvas} className="top-view-canvas" role="img" aria-label="ARISE jet seen from above gliding past clouds" />
    </div>
  </section>;
}
