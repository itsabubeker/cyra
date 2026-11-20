import { Button } from '@/components/ui/button';
import { EmptyState } from '@/components/shared/empty-state';
import { API_BASE } from '@/api/http';

interface ServerUnreachableProps {
  onRetry: () => void;
  retrying: boolean;
}

export function ServerUnreachable({ onRetry, retrying }: ServerUnreachableProps) {
  const serverAddress = API_BASE || window.location.origin;

  return (
    <EmptyState
      fullScreen
      indicator={<span className="size-2.5 rounded-full bg-danger shadow-[0_0_14px_var(--danger)]" />}
      title="Can't reach your Cyra server"
      description={<span className="font-mono text-xs tracking-[0.08em] uppercase">At {serverAddress}</span>}
    >
      <Button onClick={onRetry} disabled={retrying}>
        {retrying ? 'Retrying…' : 'Retry'}
      </Button>
    </EmptyState>
  );
}
