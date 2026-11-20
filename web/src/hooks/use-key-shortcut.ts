import { useEffect, useEffectEvent } from 'react';

function isTypingTarget(target: EventTarget | null) {
  return (
    target instanceof HTMLElement &&
    (target.isContentEditable || ['INPUT', 'TEXTAREA', 'SELECT'].includes(target.tagName))
  );
}

/** Runs `handler` when `key` is pressed anywhere on the page, except while typing in a field. */
export function useKeyShortcut(key: string, handler: (event: KeyboardEvent) => void) {
  const onShortcut = useEffectEvent(handler);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key !== key || event.metaKey || event.ctrlKey || event.altKey) return;
      if (isTypingTarget(event.target)) return;
      onShortcut(event);
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [key]);
}
