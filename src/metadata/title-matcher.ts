export interface Parsed {
  title: string;
  year: number | null;
}

export interface Candidate {
  title: string;
  originalTitle?: string;
  year: number | null;
}

export function normalizeTitle(raw: string): string {
  return raw
    .toLowerCase()
    .normalize('NFD')
    .replace(/\p{M}/gu, '') // strip diacritics: Amélie -> amelie
    .replace(/['’]/g, '') // don't -> dont, pan's -> pans
    .replace(/&/g, ' and ')
    .replace(/[^a-z0-9]+/g, ' ') // punctuation -> single space
    .trim()
    .replace(/^the /, '');
}

function bigrams(s: string): Map<string, number> {
  const m = new Map<string, number>();
  for (let i = 0; i < s.length - 1; i++) {
    const g = s.slice(i, i + 2);
    m.set(g, (m.get(g) ?? 0) + 1);
  }
  return m;
}

/** Dice coefficient on character bigrams, 0..1. Inputs should be normalized. */
export function dice(a: string, b: string): number {
  if (!a || !b) return 0;
  if (a === b) return 1;
  if (a.length < 2 || b.length < 2) return 0;
  const A = bigrams(a);
  const B = bigrams(b);
  let overlap = 0;
  for (const [g, n] of A) overlap += Math.min(n, B.get(g) ?? 0);
  return (2 * overlap) / (a.length - 1 + (b.length - 1));
}

function yearPenalty(a: number | null, b: number | null): number {
  if (a === null || b === null) return 0; // no year: no evidence either way
  const diff = Math.abs(a - b);
  if (diff === 0) return 0;
  if (diff === 1) return 0.05; // festival vs. release year
  return 0.25;
}

export function scoreCandidate(parsed: Parsed, cand: Candidate): number {
  const p = normalizeTitle(parsed.title);
  const titleScore = Math.max(
    dice(p, normalizeTitle(cand.title)),
    cand.originalTitle ? dice(p, normalizeTitle(cand.originalTitle)) : 0,
  );
  return Math.max(0, titleScore - yearPenalty(parsed.year, cand.year));
}

export function pickBest<T extends Candidate>(
  parsed: Parsed,
  candidates: T[],
): { candidate: T; score: number } | null {
  let best: { candidate: T; score: number } | null = null;
  for (const candidate of candidates) {
    const score = scoreCandidate(parsed, candidate);
    if (!best || score > best.score) best = { candidate, score };
  }
  return best;
}
