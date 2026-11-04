import { parseFilename } from './filenameParser.js';

describe('parseFilename', () => {
  it.each([
    // [input, expected title, expected year]
    ['The.Matrix.1999.1080p.BluRay.x264.mkv', 'The Matrix', 1999],
    ['Matrix (1999).mp4', 'Matrix', 1999],
    ['[YTS] Inception_2010_720p.mp4', 'Inception', 2010],
    [
      'Spider-Man.No.Way.Home.2021.2160p.WEB-DL.mkv',
      'Spider-Man No Way Home',
      2021,
    ],
    ['Heat - 1995.mkv', 'Heat', 1995],

    // year is part of the title
    ['2001.A.Space.Odyssey.1968.mkv', '2001 A Space Odyssey', 1968],
    ['Blade Runner 2049 (2017).mkv', 'Blade Runner 2049', 2017],
    ['Blade.Runner.2049.1080p.BluRay.mkv', 'Blade Runner 2049', null],
    ['Wonder Woman 1984 2020 1080p.mkv', 'Wonder Woman 1984', 2020],
    ['1917.2019.720p.mkv', '1917', 2019],
    ['1917.mkv', '1917', null],

    // no year at all
    ['Some Movie.mkv', 'Some Movie', null],
    ['Some.Movie.1080p.BluRay.mkv', 'Some Movie', null],

    ['Gladiator.EXTENDED.2000.1080.BrRip.264.YIFY.mp4', 'Gladiator', 2000],
    [
      'Donnie.Darko.DIRECTORS.CUT.2001.1080p.BrRip.x264.YIFY.mp4',
      'Donnie Darko',
      2001,
    ],
    ['Gladiator - Extended (2000).mkv', 'Gladiator', 2000],
    // regression guard: "uncut" must NOT be stripped
    ['Uncut.Gems.2019.1080p.BluRay.x264.mp4', 'Uncut Gems', 2019],
  ])('%s -> %s (%s)', (input, title, year) => {
    expect(parseFilename(input)).toEqual({ title, year });
  });
});
