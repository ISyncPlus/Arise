import { useEffect, useMemo, useState } from 'react';
import { Nav } from './components/Nav';
import { Hero } from './components/Hero';
import { Aircraft } from './components/Aircraft';
import { Charter } from './components/Charter';
import { Ownership } from './components/Ownership';
import { Contact } from './components/Contact';
import { Footer } from './components/Footer';
import { Soundscape } from './lib/sound';
import { useTheme } from './hooks/useTheme';

export type Interest = 'Charter' | 'Ownership' | 'General Inquiry';

export default function App() {
  const { theme, toggleTheme } = useTheme();
  const [reduced, setReduced] = useState(() => window.matchMedia('(prefers-reduced-motion: reduce)').matches);
  const [soundOn, setSoundOn] = useState(false);
  const [interest, setInterest] = useState<Interest>('Charter');
  const sound = useMemo(() => new Soundscape(), []);
  useEffect(() => () => sound.dispose(), [sound]);
  useEffect(() => { document.documentElement.classList.toggle('motion-reduced', reduced); }, [reduced]);
  const toggleSound = () => { void sound.toggle().then(setSoundOn); };
  const selectInterest = (value: Interest) => setInterest(value);
  return <>
    <a className="skip-link" href="#main">Skip to content</a>
    <Nav reduced={reduced} onMotion={() => setReduced(!reduced)} sound={soundOn} onSound={toggleSound} theme={theme} onTheme={toggleTheme} />
    <main id="main">
      <Hero reduced={reduced} onMove={() => sound.whoosh(reduced ? .22 : 2.6)} />
      <Aircraft reduced={reduced} onHover={() => sound.chime()} onInterest={selectInterest} />
      <Charter reduced={reduced} onInterest={selectInterest} />
      <Ownership reduced={reduced} onInterest={selectInterest} />
      <Contact reduced={reduced} interest={interest} onInterest={selectInterest} />
    </main>
    <Footer sound={soundOn} onSound={toggleSound} theme={theme} onTheme={toggleTheme} />
  </>;
}
