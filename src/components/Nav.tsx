import { useState } from 'react';
import { ThemeToggle } from './ThemeToggle';
import type { Theme } from '../hooks/useTheme';

type Props = { reduced: boolean; onMotion: () => void; sound: boolean; onSound: () => void; theme: Theme; onTheme: () => void };

export function Nav({ reduced, onMotion, sound, onSound, theme, onTheme }: Props) {
  const [open, setOpen] = useState(false);
  return <header className="site-nav">
    <a className="brand" href="#top" aria-label="ARISE, back to top">ARISE<span className="brand-dot">·</span></a>
    <button className="menu-button mono" type="button" aria-expanded={open} aria-controls="main-navigation" onClick={() => setOpen(!open)}>{open ? 'Close' : 'Menu'} <span aria-hidden="true">{open ? '×' : '☰'}</span></button>
    <nav id="main-navigation" className={open ? 'nav-links is-open' : 'nav-links'} aria-label="Main navigation" onClick={() => setOpen(false)}>
      <a href="#aircraft">Aircraft</a><a href="#charter">Charter</a><a href="#ownership">Ownership</a><a href="#contact">Contact</a>
      <div className="mobile-controls">
        <ThemeToggle theme={theme} onToggle={onTheme} />
        <button className="quiet-toggle mono" type="button" aria-pressed={sound} onClick={event => { event.stopPropagation(); onSound(); }}>Sound {sound ? 'on' : 'off'}</button>
        <button className="quiet-toggle mono" type="button" aria-pressed={!reduced} onClick={event => { event.stopPropagation(); onMotion(); }}>Motion {reduced ? 'off' : 'on'}</button>
      </div>
    </nav>
    <div className="nav-controls">
      <ThemeToggle theme={theme} onToggle={onTheme} />
      <button className="quiet-toggle mono" type="button" aria-pressed={sound} onClick={onSound}>Sound {sound ? 'on' : 'off'}</button>
      <button className="quiet-toggle mono" type="button" aria-pressed={!reduced} onClick={onMotion}>Motion {reduced ? 'off' : 'on'}</button>
    </div>
  </header>;
}
