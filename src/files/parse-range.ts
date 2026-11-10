export type RangeResult =
  | { kind: 'full' | 'unsatisfiable' }
  | { kind: 'partial'; start: number; end: number };

export const parseRange = ({
  header,
  size,
}: {
  header: string | undefined;
  size: number;
}): RangeResult => {
  if (!header?.startsWith('bytes=')) return { kind: 'full' };

  const parts = header.replace('bytes=', '').split('-');
  if (parts.length !== 2) return { kind: 'unsatisfiable' };

  const start = parseInt(parts[0], 10);
  const end = parseInt(parts[1], 10);
  const hasStart = !Number.isNaN(start);
  const hasEnd = !Number.isNaN(end);

  if (hasStart && hasEnd) {
    if (start >= size || start > end) return { kind: 'unsatisfiable' };
    return { kind: 'partial', start, end: Math.min(end, size - 1) };
  }

  if (hasStart) {
    if (start >= size) return { kind: 'unsatisfiable' };
    return { kind: 'partial', start, end: size - 1 };
  }

  if (hasEnd) {
    const count = end;
    if (count === 0 || size === 0) return { kind: 'unsatisfiable' };
    return {
      kind: 'partial',
      start: Math.max(0, size - count),
      end: size - 1,
    };
  }

  return { kind: 'unsatisfiable' };
};
