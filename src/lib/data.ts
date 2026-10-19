import { media, models } from './assets';

export const fleet = [
  { name: 'Nocturne', finish: 'Obsidian black', line: 'The long-range flagship, built for crossing oceans overnight and waking up somewhere new.', media: media.fleet.nocturne, model: models.longrange, color: '#1a1d23', metalness: .6, roughness: .22 },
  { name: 'Lumen', finish: 'Pearl white', line: 'Our most requested aircraft: quiet, quick to the apron and at home on short city runways.', media: media.fleet.lumen, model: models.hero, color: '#e9ecef', metalness: .35, roughness: .32 },
  { name: 'Argent', finish: 'Brushed silver', line: 'A supersonic concept and our study in how fast quiet can travel.', media: media.fleet.argent, model: models.supersonic, color: '#b9bec6', metalness: .9, roughness: .26 },
  { name: 'Meridian', finish: 'Deep navy', line: 'A cabin set up for the working week: four seats, one long desk, no waiting.', media: media.fleet.meridian, model: models.compact, color: '#16223a', metalness: .5, roughness: .3 },
  { name: 'Solace', finish: 'Champagne bronze', line: 'An heirloom finish for owners who fly with family and want it to feel like home.', media: media.fleet.solace, model: models.longrange, color: '#9a7a5a', metalness: .85, roughness: .3 },
] as const;

export const ownership = [
  { title: 'Fractional share', line: 'Own the hours you fly.', media: media.ownership.fractional },
  { title: 'Cabin craft', line: 'A cabin finished by hand.', media: media.ownership.cabin },
  { title: 'Full ownership', line: 'An aircraft that is wholly yours.', media: media.ownership.full },
  { title: 'Care', line: 'Looked after, quietly.', media: media.ownership.detail },
  { title: 'Leaseback', line: 'Let it earn while you are home.', media: media.ownership.lease },
] as const;
