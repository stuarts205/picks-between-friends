import { useEffect, useState } from 'react';

type GameStatus = {
    status: 'STATUS_SCHEDULED' | 'STATUS_IN_PROGRESS' | 'STATUS_FINAL';
    startTime?: string;
}

export function useGameStatus(gameId: string, intervalMs: number = 60000) {
  const [status, setStatus] = useState<GameStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!gameId) return;

    let isMounted = true;

    const fetchStatus = async () => {
      try {
        setLoading(true);
        const res = await fetch(`/api/summary?gameId=${gameId}`);
        if (!res.ok) throw new Error('Failed to fetch game status');
        const data = await res.json();

        if (isMounted) {
          setStatus({ status: data.status, startTime: data.startTime });
          setError(null);
        }
      } catch (err) {
        if (isMounted) setError((err as Error).message);
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    fetchStatus(); // initial fetch
    const interval = setInterval(fetchStatus, intervalMs); // poll

    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, [gameId, intervalMs]);

  return { status, loading, error };
}