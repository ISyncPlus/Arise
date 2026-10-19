import { ThemeToggle } from './ThemeToggle';
import type { Theme } from '../hooks/useTheme';
type Props = { sound: boolean; onSound: () => void; theme: Theme; onTheme: () => void };

export function Footer({ sound, onSound, theme, onTheme }: Props) {
  return <footer className="site-footer">
    <div className="footer-top"><a className="footer-brand" href="#top" aria-label="ARISE, back to top">ARISE<span>·</span></a><p>Private aviation,<br />above the weather.</p><nav aria-label="Footer navigation"><a href="#aircraft">Aircraft</a><a href="#charter">Charter</a><a href="#ownership">Ownership</a><a href="#contact">Contact</a></nav></div>
    <div className="footer-bottom mono"><span>© 2026 ARISE</span><span><a href="mailto:flights@arise.aero">flights@arise.aero</a> · Geneva · London · Dubai</span><ThemeToggle theme={theme} onToggle={onTheme} /><button type="button" aria-pressed={sound} onClick={onSound}>Sound {sound ? 'on' : 'off'}</button><a href="#top">Back to top ↑</a></div>
    <p className="maker-credit">made with <span role="img" aria-label="blue heart">💙</span> by Ebube Ezedimbu</p>
  </footer>;
}
