const base = 'https://media.scrollhaus.ai/sites/orvelle/assets/';

export const models = {
  hero: `${base}models/hero.glb`,
  longrange: `${base}models/longrange.glb`,
  supersonic: `${base}models/supersonic.glb`,
  compact: `${base}models/compact.glb`,
} as const;

const loop = (name: string) => ({
  src: `${base}video/${name}.mp4`,
  poster: `${base}video/${name}.webp`,
});

export const media = {
  fleet: {
    nocturne: loop('card-nocturne'),
    lumen: loop('card-lumen'),
    argent: loop('card-argent'),
    meridian: loop('card-meridian'),
    solace: loop('card-solace'),
  },
  ownership: {
    fractional: loop('own-fractional'),
    cabin: loop('own-cabin'),
    full: loop('own-full'),
    detail: loop('own-detail'),
    lease: loop('own-lease'),
  },
  charter: loop('charter'),
  clouds: loop('clouds'),
} as const;
