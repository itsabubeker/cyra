import { Button } from '@/components/ui/button';

interface MarkWatchedPromptProps {
  title: string;
  onConfirm: () => void;
  onDismiss: () => void;
}

export function MarkWatchedPrompt({ title, onConfirm, onDismiss }: MarkWatchedPromptProps) {
  return (
    <div
      role="dialog"
      aria-label="Mark as watched"
      className="absolute right-4 bottom-28 z-20 flex w-[min(360px,calc(100%-2rem))] flex-col gap-3.5 rounded-xl border border-input bg-card/90 p-5 backdrop-blur-md animate-in fade-in slide-in-from-bottom-2 md:right-9 md:bottom-32"
    >
      <p className="eyebrow text-amber">Almost the end</p>
      <p className="display text-[26px] leading-[1.1]">Mark {title} as watched?</p>
      <div className="flex gap-2">
        <Button className="flex-1" onClick={onConfirm}>
          Mark watched
        </Button>
        <Button variant="outline" onClick={onDismiss}>
          Not now
        </Button>
      </div>
    </div>
  );
}
