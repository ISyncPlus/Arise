import { useCallback, useEffect, useRef, useState } from 'react';
import type { RefObject } from 'react';
import type { CameraView, FlightScene } from '../scene/FlightScene';

export const views: CameraView[] = [
  { pos: [5.6, .3, -12.5], target: [3.4, -.5, -1] },
  { pos: [17, .6, .5], target: [0, .1, 0], via: [15, 1.4, -9] },
  { pos: [10, 9.5, 5], target: [0, -.4, -.5], via: [16, 6, 3] },
  { pos: [3.1, 1, -7.4], target: [0, .3, -3.4], via: [8, 5, -6] },
  { pos: [5.6, 2.2, 6.8], target: [1, .2, 1.2], via: [5.6, 2.4, -1] },
  { pos: [-12, 3.6, 17], target: [0, 0, -2.5], via: [1.5, 4.8, 14] },
];

export const captions = [
  null,
  { label: 'Profile', text: 'Drawn long and low, so the cabin rides level through thin air.' },
  { label: 'Wing', text: 'A swept wing that rests the airframe on calm air, high above the weather.' },
  { label: 'Flight deck', text: 'Two pilots on every flight. Your cabin begins three steps behind them.' },
  { label: 'Power', text: 'Engines set at the tail keep the noise behind you and the cabin to a murmur.' },
  { label: 'Onward', text: 'Wherever you are going next, it is already on the horizon.' },
] as const;

export function useHeroStages(scene: RefObject<FlightScene | null>, reduced: boolean, onMove: () => void) {
  const [stage, setStage] = useState(0);
  const [settled, setSettled] = useState(true);
  const stageRef = useRef(0);
  const moving = useRef(false);
  const lastWheel = useRef(0);
  const touchStart = useRef<number | null>(null);
  const timer = useRef<number | undefined>(undefined);
  const onMoveRef = useRef(onMove);
  const reducedRef = useRef(reduced);
  reducedRef.current = reduced;
  onMoveRef.current = onMove;

  const go = useCallback((direction: number) => {
    if (moving.current || !scene.current) return;
    const previous = stageRef.current;
    const next = stageRef.current + direction;
    if (next < 0 || next > 5) return;
    const duration = reducedRef.current ? 220 : 2600;
    moving.current = true; setSettled(false);
    stageRef.current = next; setStage(next);
    scene.current.moveTo({ ...views[next], via: views[direction < 0 ? previous : next].via }, duration);
    onMoveRef.current();
    window.clearTimeout(timer.current);
    timer.current = window.setTimeout(() => { moving.current = false; setSettled(true); }, duration);
  }, [scene]);

  useEffect(() => () => window.clearTimeout(timer.current), []);

  useEffect(() => {
    const atTop = () => window.scrollY <= 8 && !document.querySelector('dialog[open], .nav-links.is-open');
    const wheel = (event: WheelEvent) => {
      if (!atTop()) return;
      if (Math.abs(event.deltaY) <= Math.abs(event.deltaX)) return;
      const now = performance.now(), fresh = now - lastWheel.current >= 220;
      lastWheel.current = now;
      if (moving.current) { event.preventDefault(); return; }
      if (event.deltaY < 0 && stageRef.current === 0) { event.preventDefault(); return; }
      if (event.deltaY > 0 && stageRef.current === 5) { if (!fresh) event.preventDefault(); return; }
      event.preventDefault();
      if (fresh && event.deltaY !== 0) go(Math.sign(event.deltaY));
    };
    const key = (event: KeyboardEvent) => {
      if (!atTop() || (event.target as HTMLElement)?.closest('input,textarea,select,button,a,[contenteditable]')) return;
      const direction = ['ArrowDown', 'PageDown', ' '].includes(event.key) ? 1 : ['ArrowUp', 'PageUp'].includes(event.key) ? -1 : 0;
      if (!direction) return;
      if (direction > 0 && stageRef.current === 5 && !moving.current) return;
      event.preventDefault(); go(direction);
    };
    const start = (event: TouchEvent) => { if (atTop()) touchStart.current = event.touches[0]?.clientY ?? null; };
    const move = (event: TouchEvent) => { if (atTop() && touchStart.current !== null && (stageRef.current < 5 || event.touches[0].clientY > touchStart.current || moving.current)) event.preventDefault(); };
    const end = (event: TouchEvent) => {
      if (touchStart.current === null || !atTop()) return;
      const delta = touchStart.current - (event.changedTouches[0]?.clientY ?? touchStart.current);
      touchStart.current = null;
      if (Math.abs(delta) >= 40) go(Math.sign(delta));
    };
    window.addEventListener('wheel', wheel, { passive: false });
    window.addEventListener('keydown', key);
    window.addEventListener('touchstart', start, { passive: true });
    window.addEventListener('touchmove', move, { passive: false });
    window.addEventListener('touchend', end);
    return () => {
      window.removeEventListener('wheel', wheel); window.removeEventListener('keydown', key);
      window.removeEventListener('touchstart', start); window.removeEventListener('touchmove', move); window.removeEventListener('touchend', end);
    };
  }, [go]);
  return { stage, settled, go };
}
