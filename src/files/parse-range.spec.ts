import { parseRange, RangeResult } from './parse-range.js';

describe('parseRange', () => {
  const cases: [string, string | undefined, RangeResult][] = [
    ['no header', undefined, { kind: 'full' }],
    ['first 100 bytes', 'bytes=0-99', { kind: 'partial', start: 0, end: 99 }],
    ['open end', 'bytes=500-', { kind: 'partial', start: 500, end: 999 }],
    ['suffix', 'bytes=-200', { kind: 'partial', start: 800, end: 999 }],
    [
      'end clamped',
      'bytes=900-5000',
      { kind: 'partial', start: 900, end: 999 },
    ],
    ['single byte', 'bytes=5-5', { kind: 'partial', start: 5, end: 5 }],
    [
      'suffix bigger than file',
      'bytes=-5000',
      { kind: 'partial', start: 0, end: 999 },
    ],
    ['start past end of file', 'bytes=1000-', { kind: 'unsatisfiable' }],
    ['start after end', 'bytes=500-100', { kind: 'unsatisfiable' }],
    ['zero suffix', 'bytes=-0', { kind: 'unsatisfiable' }],
    ['wrong unit', 'items=0-99', { kind: 'full' }],
    ['garbage', 'bytes=abc', { kind: 'unsatisfiable' }],
  ];

  it.each(cases)('%s', (_name, header, expected) => {
    expect(parseRange({ header, size: 1000 })).toEqual(expected);
  });

  it('rejects any range on an empty file', () => {
    expect(parseRange({ header: 'bytes=0-99', size: 0 })).toEqual({
      kind: 'unsatisfiable',
    });
  });
});
