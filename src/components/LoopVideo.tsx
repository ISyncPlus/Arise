import { memo, useEffect, useRef } from 'react';
import type { CSSProperties } from 'react';

type Props = { media: { src: string; poster: string }; label: string; active: boolean; reduced: boolean; className?: string; style?: CSSProperties };

export const LoopVideo = memo(function LoopVideo({ media, label, active, reduced, className = '', style }: Props) {
  const ref = useRef<HTMLVideoElement>(null);
  useEffect(() => {
    const video = ref.current;
    if (!video) return;
    let visible = false, disposed = false;
    const shouldPlay = () => !disposed && active && visible && !reduced && !document.hidden;
    const sync = () => {
      if (!shouldPlay()) { video.pause(); return; }
      void video.play().then(() => { if (!shouldPlay()) video.pause(); }).catch(() => {});
    };
    const observer = new IntersectionObserver(([entry]) => { visible = entry.isIntersecting && entry.intersectionRatio >= .08; sync(); }, { threshold: [0, .08] });
    observer.observe(video);
    document.addEventListener('visibilitychange', sync);
    return () => { disposed = true; observer.disconnect(); document.removeEventListener('visibilitychange', sync); video.pause(); };
  }, [active, reduced, media.src]);
  return <video ref={ref} className={className} style={style} src={media.src} poster={media.poster} aria-label={label} muted loop playsInline preload="none" />;
});
