import {
  dice,
  normalizeTitle,
  pickBest,
  scoreCandidate,
} from './title-matcher.js';

describe('normalizeTitle', () => {
  it.each([
    ['Mission Impossible III', 'Mission: Impossible III'],
    ['I Love You Man', 'I Love You, Man'],
    ['L A Confidential', 'L.A. Confidential'],
    ['Amelie', 'Amélie'],
    ['Leon the Professional', 'Léon: The Professional'],
    ['Good Luck Have Fun Dont Die', "Good Luck, Have Fun, Don't Die"],
    ['Spider Man Brand New Day', 'Spider-Man: Brand New Day'],
    [
      'Captain America - The Winter Soldier',
      'Captain America: The Winter Soldier',
    ],
    ['Pans Labyrinth', "Pan's Labyrinth"],
  ])('%s equals %s', (parsed, tmdb) => {
    expect(normalizeTitle(parsed)).toBe(normalizeTitle(tmdb));
  });
});

describe('dice', () => {
  it('is 1 for identical strings and 0 for unrelated ones', () => {
    expect(dice('heat', 'heat')).toBe(1);
    expect(dice('heat', 'zzzz')).toBe(0);
  });

  it('scores spelling variants high', () => {
    expect(
      dice('inglourious bastards', 'inglourious basterds'),
    ).toBeGreaterThan(0.85);
  });

  it('scores a sequel lower than the original', () => {
    expect(dice('ted', 'ted 2')).toBeLessThan(0.8);
  });
});

describe('pickBest', () => {
  it('uses the year to separate The Batman from Batman', () => {
    const best = pickBest({ title: 'The Batman', year: 2022 }, [
      { title: 'Batman', year: 1989 },
      { title: 'The Batman', year: 2022 },
    ]);
    expect(best?.candidate.year).toBe(2022);
  });

  it('tolerates a one-year difference', () => {
    const score = scoreCandidate(
      { title: 'Rush', year: 2013 },
      { title: 'Rush', year: 2014 },
    );
    expect(score).toBeGreaterThan(0.9);
  });

  it('works without a year (Blade Runner 2049)', () => {
    const best = pickBest({ title: 'Blade Runner 2049', year: null }, [
      { title: 'Blade Runner', year: 1982 },
      { title: 'Blade Runner 2049', year: 2017 },
    ]);
    expect(best?.candidate.year).toBe(2017);
  });

  it('scores a foreign title low so it stays unmatched', () => {
    const score = scoreCandidate(
      { title: 'Millennium Uomini che Odiano Le Donne', year: 2011 },
      {
        title: 'The Girl with the Dragon Tattoo',
        originalTitle: 'Män som hatar kvinnor',
        year: 2011,
      },
    );
    expect(score).toBeLessThan(0.5);
  });

  it('returns null for no candidates', () => {
    expect(pickBest({ title: 'Heat', year: 1995 }, [])).toBeNull();
  });
});
