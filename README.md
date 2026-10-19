<div align="center">

# ARISE

### Private aviation, above the weather.

An immersive, editorial landing page for a fictional private aviation house. ARISE brings together a cinematic 3D aircraft reveal, an interactive fleet, considered charter and ownership stories, and a direct enquiry experience.

<p>
  <img src="https://img.shields.io/badge/React-19-61DAFB?logo=react&logoColor=white" alt="React 19" />
  <img src="https://img.shields.io/badge/TypeScript-5-3178C6?logo=typescript&logoColor=white" alt="TypeScript" />
  <img src="https://img.shields.io/badge/Vite-6-646CFF?logo=vite&logoColor=white" alt="Vite" />
  <img src="https://img.shields.io/badge/Three.js-WebGL-black?logo=threedotjs&logoColor=white" alt="Three.js and WebGL" />
  <img src="https://img.shields.io/badge/Tailwind_CSS-4-06B6D4?logo=tailwindcss&logoColor=white" alt="Tailwind CSS 4" />
</p>

<p>
  <a href="#-experience">Experience</a> ·
  <a href="#-screenshots">Screenshots</a> ·
  <a href="#-getting-started">Getting started</a> ·
  <a href="#-configuration">Configuration</a>
</p>

</div>

## ✈️ About ARISE

ARISE is a responsive React experience designed around the feeling of private flight rather than a conventional booking dashboard. The page guides visitors from a quiet, scroll-controlled aircraft reveal through the fleet, charter service, ownership options, and a conversation form.

The visual direction is intentionally calm and premium: dark skies, editorial typography, restrained motion, looping aircraft film, and small details that reward exploration.

> **Important:** ARISE is a fictional aviation brand and this repository is a visual/product experience. It is not a live booking platform or an aviation operator.

## 🎬 Experience

### 01 / The fleet

Scroll through five aircraft presented as an interactive vertical reel:

| Aircraft | Finish | Story |
| --- | --- | --- |
| **Nocturne** | Obsidian black | A long-range flagship for crossing oceans overnight |
| **Lumen** | Pearl white | Quiet, quick, and at home on short city runways |
| **Argent** | Brushed silver | A supersonic concept and study in speed |
| **Meridian** | Deep navy | A working-week cabin with four seats and one long desk |
| **Solace** | Champagne bronze | An heirloom finish for flying with family |

Each aircraft can be opened in a detail dialog with looping media, finish information, and a browser-rendered Three.js model.

### 02 / Charter

The charter section pairs a full-bleed aircraft film with service details:

- Two-hour confirmation
- One familiar coordinator
- Private terminals
- Food from where you leave
- A place for family, colleagues, and companions

### 03 / Ownership

The ownership carousel covers five ways to fly:

- Fractional share
- Cabin craft
- Full ownership
- Care
- Leaseback

The carousel supports mouse, touch/swipe, and left/right keyboard controls.

### 04 / Begin a conversation

The contact section validates name, email, interest, and message before delivery. It supports both a JSON endpoint and a transparent email fallback for local or static deployments.

## 🖼️ Screenshots

These are the same hosted poster images used by the application’s fleet, charter, ownership, and cloud scenes.

<table>
  <tr>
    <td width="50%">
      <img src="https://media.scrollhaus.ai/sites/orvelle/assets/video/card-nocturne.webp" alt="ARISE Nocturne aircraft in flight" />
      <br /><sub><b>The fleet</b> · Nocturne</sub>
    </td>
    <td width="50%">
      <img src="https://media.scrollhaus.ai/sites/orvelle/assets/video/charter.webp" alt="ARISE jet crossing a clouded sky" />
      <br /><sub><b>Charter</b> · On your clock</sub>
    </td>
  </tr>
  <tr>
    <td width="50%">
      <img src="https://media.scrollhaus.ai/sites/orvelle/assets/video/own-cabin.webp" alt="ARISE aircraft cabin detail" />
      <br /><sub><b>Ownership</b> · Cabin craft</sub>
    </td>
    <td width="50%">
      <img src="https://media.scrollhaus.ai/sites/orvelle/assets/video/clouds.webp" alt="Clouds viewed from above" />
      <br /><sub><b>Contact</b> · Above the weather</sub>
    </td>
  </tr>
</table>

## 🧭 Interface details

- **Theme switcher** — the visitor’s light/dark preference is remembered, while the night-sky flight and film scenes preserve their intended contrast.
- **Sound toggle** — sound is opt-in and never starts automatically.
- **Motion toggle** — visitors can turn the enhanced motion experience off, in addition to the site respecting `prefers-reduced-motion`.
- **Responsive navigation** — compact mobile menu with direct links to Aircraft, Charter, Ownership, and Contact.
- **Accessible interactions** — skip link, semantic landmarks, labelled controls, keyboard-accessible dialogs/carousels, and live form status messages.
- **Graceful 3D failure** — if the aircraft visual cannot load, the rest of the page remains available and an explicit message is shown.
- **Performance-minded scenes** — offscreen scenes pause, hidden tabs are handled, and the top-view scene only renders when needed.

## 🛠️ Tech stack

| Area | Technology |
| --- | --- |
| UI | React 19 + TypeScript |
| Build tooling | Vite 6 |
| Styling | Tailwind CSS 4 + custom CSS |
| 3D | Three.js 0.160 with GLB models |
| Media | Hosted MP4 and WebP assets |
| Typography | Forum, Red Hat Display, Red Hat Mono |
| Delivery | Static frontend with optional JSON form endpoint |

## 🚀 Getting started

### Requirements

- Node.js 18 or newer
- npm 9 or newer

### Install and run

```sh
npm install
npm run dev
```

Open the local URL printed by Vite. The development server binds to `127.0.0.1`.

### Build and preview

```sh
npm run build
npm run preview
```

The build runs the TypeScript project build and writes the production site to `dist/`.

## ⚙️ Configuration

Create a local `.env` file, or define the variable in your deployment environment, to send contact form submissions to an API:

```sh
VITE_FORM_ENDPOINT=https://example.com/api/arise-inquiries
```

The form sends JSON in this shape:

```json
{
  "name": "Alex Morgan",
  "email": "alex@example.com",
  "interest": "Charter",
  "message": "I would like to discuss a flight from Geneva."
}
```

Any 2xx response is treated as a successful submission. If `VITE_FORM_ENDPOINT` is not set, ARISE opens a prefilled email to `flights@arise.aero` and explicitly explains that the email still needs to be sent by the visitor.

## 🗂️ Project structure

```text
.
├── index.html                 # HTML shell, metadata, fonts, and page title
├── src/
│   ├── App.tsx                # Page composition and shared interaction state
│   ├── components/
│   │   ├── Hero.tsx           # Scroll-controlled opening scene
│   │   ├── Aircraft.tsx       # Fleet reel and aircraft detail dialog
│   │   ├── Charter.tsx        # Charter film, benefits, and top-view scene
│   │   ├── Ownership.tsx      # Ownership carousel
│   │   ├── Contact.tsx         # Validated enquiry form
│   │   └── Nav.tsx/Footer.tsx # Site navigation and footer controls
│   ├── hooks/                 # Theme and hero-stage behaviour
│   ├── lib/
│   │   ├── assets.ts          # Remote model and media URLs
│   │   └── data.ts            # Fleet and ownership content
│   ├── scene/                 # Three.js flight scene implementation
│   └── styles.css             # Layout, responsive design, and motion system
├── dist/                      # Generated production output
└── package.json
```

## ⚡ Performance notes

- Large GLB, MP4, and WebP assets are served from the configured remote media host rather than bundled locally.
- Cloud particles share an instanced draw call.
- Video scenes pause when they are outside the viewport or when the tab is hidden.
- The top-view scene loads near the viewport and renders only when changes require it.
- Scroll transforms update without forcing the video-card collection to re-render.
- The Three.js scene loads separately from the page shell.

## 📜 Available scripts

| Command | Description |
| --- | --- |
| `npm run dev` | Start the Vite development server |
| `npm run build` | Type-check and create the production bundle |
| `npm run preview` | Serve the production build locally |

## 💙 Credits

Made with 💙 by **Ebube Ezedimbu**.

## License

This repository contains a fictional brand experience. Review the licensing terms for external media and model assets before redistributing them.
