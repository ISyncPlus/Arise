import { useState } from 'react';
import type { FormEvent } from 'react';
import { media } from '../lib/assets';
import { LoopVideo } from './LoopVideo';
import type { Interest } from '../App';

type Props = { reduced: boolean; interest: Interest; onInterest: (value: Interest) => void };
type Errors = Partial<Record<'name' | 'email' | 'interest' | 'message', string>>;
const interests: Interest[] = ['Charter', 'Ownership', 'General Inquiry'];
const endpoint = import.meta.env.VITE_FORM_ENDPOINT?.trim() as string | undefined;

export function Contact({ reduced, interest, onInterest }: Props) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [errors, setErrors] = useState<Errors>({});
  const [status, setStatus] = useState('');
  const [sending, setSending] = useState(false);
  const clear = (field: keyof Errors) => setErrors(current => ({ ...current, [field]: undefined }));

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const next: Errors = {};
    if (name.trim().length < 2) next.name = 'Please enter your name.';
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) next.email = 'Please enter a valid email address.';
    if (!interests.includes(interest)) next.interest = 'Please choose an area of interest.';
    if (message.trim().length < 10) next.message = 'Please add a message of at least 10 characters.';
    setErrors(next);
    if (Object.keys(next).length) { setStatus('Please correct the highlighted fields.'); return; }
    setSending(true); setStatus('');
    const payload = { name: name.trim(), email: email.trim(), interest, message: message.trim() };
    if (!endpoint) {
      const subject = encodeURIComponent(`ARISE inquiry — ${interest}`);
      const body = encodeURIComponent(`Name: ${payload.name}\nEmail: ${payload.email}\nInterest: ${interest}\n\n${payload.message}`);
      window.location.href = `mailto:flights@arise.aero?subject=${subject}&body=${body}`;
      setStatus('Your email app is ready with your message. Nothing has been sent yet.');
      setSending(false);
      return;
    }
    try {
      const response = await fetch(endpoint, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
      if (!response.ok) throw new Error(`Request failed: ${response.status}`);
      setStatus('Thank you. Your inquiry has been sent. We will be in touch.');
      setName(''); setEmail(''); setMessage('');
    } catch {
      setStatus('We could not send your inquiry. Please try again or email flights@arise.aero.');
    } finally {
      setSending(false);
    }
  }

  return <section id="contact" className="contact-section" aria-labelledby="contact-title">
    <LoopVideo media={media.clouds} label="Slowly drifting clouds" active reduced={reduced} className="contact-clouds" />
    <div className="contact-shade" />
    <div className="contact-grid">
      <div className="contact-intro"><p className="eyebrow">04 / Begin a conversation</p><h2 id="contact-title">Your Next Chapter<br /><em>Begins Above.</em></h2><p>Tell us what you have in mind. A member of our team will take it from there.</p><a href="mailto:flights@arise.aero" className="contact-email">flights@arise.aero <span aria-hidden="true">↗</span></a></div>
      <form className="contact-form" onSubmit={submit} noValidate>
        <div className="form-row">
          <label>Name<input value={name} onChange={event => { setName(event.target.value); clear('name'); }} autoComplete="name" aria-invalid={!!errors.name} aria-describedby={errors.name ? 'name-error' : undefined} placeholder="Your name" required /></label>
          {errors.name && <span id="name-error" className="field-error">{errors.name}</span>}
        </div>
        <div className="form-row">
          <label>Email<input type="email" value={email} onChange={event => { setEmail(event.target.value); clear('email'); }} autoComplete="email" aria-invalid={!!errors.email} aria-describedby={errors.email ? 'email-error' : undefined} placeholder="Your email address" required /></label>
          {errors.email && <span id="email-error" className="field-error">{errors.email}</span>}
        </div>
        <fieldset className="form-row interest-field" aria-invalid={!!errors.interest} aria-describedby={errors.interest ? 'interest-error' : undefined}>
          <legend>Interest</legend><div className="interest-chips">{interests.map(value => <label key={value} className={interest === value ? 'selected' : ''}><input type="radio" name="interest" value={value} checked={interest === value} onChange={() => { onInterest(value); clear('interest'); }} />{value}</label>)}</div>
          {errors.interest && <span id="interest-error" className="field-error">{errors.interest}</span>}
        </fieldset>
        <div className="form-row"><label>Message<textarea value={message} onChange={event => { setMessage(event.target.value); clear('message'); }} aria-invalid={!!errors.message} aria-describedby={errors.message ? 'message-error' : undefined} rows={4} placeholder="Where would you like to go?" required /></label>{errors.message && <span id="message-error" className="field-error">{errors.message}</span>}</div>
        <div className="form-submit"><button className="pill" type="submit" disabled={sending}>{sending ? 'Sending…' : 'Send Inquiry'} <span aria-hidden="true">↗</span></button><p role="status" aria-live="polite">{status}</p></div>
      </form>
    </div>
  </section>;
}
