import { useRef, type KeyboardEvent } from 'react';

const ARROW_KEYS = new Set(['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown']);

/** Moves focus between `[data-grid-item]` elements of a CSS grid with the arrow keys. */
export function useGridKeyboardNav<T extends HTMLElement>() {
  const ref = useRef<T>(null);

  const onKeyDown = (event: KeyboardEvent<T>) => {
    const grid = ref.current;
    if (!grid || !ARROW_KEYS.has(event.key)) return;

    const items = Array.from(grid.querySelectorAll<HTMLElement>('[data-grid-item]'));
    const index = items.indexOf(document.activeElement as HTMLElement);
    if (index === -1) return;

    const columns = getComputedStyle(grid).gridTemplateColumns.split(' ').length;
    const offsets: Record<string, number> = {
      ArrowLeft: -1,
      ArrowRight: 1,
      ArrowUp: -columns,
      ArrowDown: columns,
    };
    const target = items[index + offsets[event.key]];
    if (!target) return;

    event.preventDefault();
    target.focus();
    target.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
  };

  return { ref, onKeyDown };
}
