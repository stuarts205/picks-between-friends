export type PlayerColor = {
  light: string;
  dark: string;
};

// Lightness steps handed out in rotation, so slices that touch differ in
// lightness as well as hue. Dark mode gets its own, narrower set.
const LIGHTNESS = {
  light: [0.52, 0.64, 0.76],
  dark: [0.52, 0.59, 0.66],
} as const;
const CHROMA = 0.15;

// Cyan can't stay saturated inside sRGB at low lightness and turns gray.
const CYAN = { from: 170, to: 230, minLightness: 0.62 };

/**
 * How the hue slots are dealt out for each player count: [stride, start hue].
 * Player n takes slot n * stride, so neighbours in the pie are `stride` hue
 * steps apart. Each pair was picked by scoring every stride and start hue for
 * that count with the dataviz palette validator, so slices that touch (or that
 * touch once a player with no wins drops out) stay easy to tell apart in light
 * and dark mode, including for red-green colour blindness. Counts that aren't
 * listed fall back to a golden-ratio stride.
 */
const ARRANGEMENTS: Record<number, [stride: number, startHue: number]> = {
  1: [1, 250],
  2: [1, 250],
  3: [1, 315],
  4: [1, 0],
  5: [2, 270],
  6: [1, 95],
  7: [3, 240],
  8: [5, 45],
  9: [5, 0],
  10: [7, 315],
  11: [7, 60],
  12: [7, 85],
  13: [8, 135],
  14: [9, 45],
  15: [11, 260],
  16: [11, 315],
  17: [11, 75],
  18: [11, 50],
  19: [13, 300],
  20: [13, 75],
};

const gcd = (a: number, b: number): number => (b ? gcd(b, a % b) : a);

const fallbackArrangement = (count: number): [number, number] => {
  let stride = Math.max(1, Math.round(count * 0.618));
  while (gcd(stride, count) !== 1) stride++;
  return [stride, 75];
};

const oklch = (lightness: number, hue: number) => {
  const inCyan = hue >= CYAN.from && hue <= CYAN.to;
  const l = inCyan ? Math.max(lightness, CYAN.minLightness) : lightness;
  return `oklch(${l.toFixed(2)} ${CHROMA} ${hue})`;
};

/**
 * One color per player, for any number of players. Index i is the i-th player
 * in whatever stable order the caller uses, so a player keeps their color.
 */
export const playerColors = (count: number): PlayerColor[] => {
  const [stride, startHue] = ARRANGEMENTS[count] ?? fallbackArrangement(count);

  return Array.from({ length: count }, (_, index) => {
    const slot = (index * stride) % count;
    const hue = Number((((startHue + (slot * 360) / count) % 360)).toFixed(1));
    // Around the wrap the last player would repeat the first player's step.
    const step = index === count - 1 && count % 3 === 1 ? 1 : index % 3;

    return {
      light: oklch(LIGHTNESS.light[step], hue),
      dark: oklch(LIGHTNESS.dark[step], hue),
    };
  });
};
