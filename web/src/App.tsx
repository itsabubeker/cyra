import { useEffect, useState } from 'react';
import { getHealth } from './api/client.ts';

type Status = 'checking' | 'ok' | 'unreachable';

export function App() {
  const [status, setStatus] = useState<Status>('checking');

  useEffect(() => {
    getHealth()
      .then(() => setStatus('ok'))
      .catch(() => setStatus('unreachable'));
  }, []);

  return (
    <main style={{ padding: 24 }}>
      <h1>Cyra</h1>
      <p>
        {status === 'checking' && 'Checking server…'}
        {status === 'ok' && 'Connected to the Cyra server.'}
        {status === 'unreachable' && "Can't reach the Cyra server."}
      </p>
    </main>
  );
}
