import { useEffect, useRef, useState } from 'react';
import type { FlightScene } from '../scene/FlightScene';
import { captions, useHeroStages, views } from '../hooks/useHeroStages';

type Props = { reduced: boolean; onMove: () => void };

export function Hero({ reduced, onMove }: Props) {
  const host = useRef<HTMLDivElement>(null);
  const scene = useRef<FlightScene | null>(null);
  const reducedRef = useRef(reduced);
  reducedRef.current = reduced;
  const [progress, setProgress] = useState(0);
  const [ready, setReady] = useState(false);
  const [showLoader, setShowLoader] = useState(true);
  const [failed, setFailed] = useState(false);
  const { stage, settled, go } = useHeroStages(scene, reduced, onMove);
  useEffect(() => {
    let cancelled = false;
    void import('../scene/FlightScene').then(({ FlightScene }) => {
      if (cancelled || !host.current) return;
      scene.current = new FlightScene(host.current, {
        onProgress: p => setProgress(p),
        onReady: () => setReady(true),
        onError: () => { setFailed(true); setReady(true); },
      });
      scene.current.setReduced(reducedRef.current);
      scene.current.moveTo(views[0], 0);
    }).catch(() => { if (!cancelled) { setFailed(true); setReady(true); } });
    return () => { cancelled = true; scene.current?.dispose(); scene.current = null; };
  }, []);
  useEffect(() => { scene.current?.setReduced(reduced); }, [reduced]);
  useEffect(() => { if (ready) { const timer = window.setTimeout(() => setShowLoader(false), 900); return () => window.clearTimeout(timer); } }, [ready]);
  return <section id="top" className="hero" aria-label="ARISE private aviation">
    <div ref={host} className={reduced && !settled ? 'hero-canvas quick-fade' : 'hero-canvas'} />
    <div className="hero-vignette" aria-hidden="true" />
    <div className="hero-copy">
      <p className="eyebrow">ARISE <span>·</span> Private aviation</p>
      <h1>Quiet, above<br /><em>everything.</em></h1>
      <p className="hero-lede">A small fleet of private jets for people who would rather arrive rested than early.</p>
      <button className="pill" type="button" onClick={() => go(1)}>Explore the Jet <span aria-hidden="true">↓</span></button>
    </div>
    <div className="hero-bottom">
      <div className="hero-caption" aria-live="polite">
        {stage > 0 && settled && <div key={stage}><span className="caption-rule" /><p className="mono">0{stage} · {captions[stage]?.label}</p><p>{captions[stage]?.text}</p></div>}
      </div>
      <p className="scroll-hint mono">{stage === 0 ? 'Scroll to move the camera' : stage === 5 ? 'Scroll to continue' : 'Scroll for the next view · up to go back'}</p>
      <div className="hero-progress mono" aria-label={`Camera view ${stage} of 5`}>
        <span>0{stage} / 05</span><div className="progress-lines">{Array.from({ length: 5 }, (_, i) => <span key={i} className={i < stage ? 'filled' : ''} />)}</div>
      </div>
    </div>
    {showLoader && <div className={ready ? 'hero-loader is-ready' : 'hero-loader'} role="status" aria-label="Loading aircraft"><span className="loader-brand">ARISE</span><span className="loader-track"><span style={{ width: `${Math.round(progress * 100)}%` }} /></span><span className="mono">Preparing your view · {Math.round(progress * 100)}%</span></div>}
    {failed && <p className="scene-error mono">Aircraft visual could not load. The rest of ARISE is ready below.</p>}
  </section>;
}
