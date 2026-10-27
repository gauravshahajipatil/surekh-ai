import { useCallback, useEffect, useState } from 'react';
import { api, ApiError } from './api';

export function useResource<T>(path: string | null) {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(Boolean(path));
  const [error, setError] = useState<string | null>(null);
  const [refreshIndex, setRefreshIndex] = useState(0);
  const reload = useCallback(() => setRefreshIndex(v => v + 1), []);
  useEffect(() => {
    if (!path) { setLoading(false); return; }
    let active = true;
    setLoading(true); setError(null);
    api.get<T>(path).then(value => { if (active) setData(value); }).catch((e: unknown) => {
      if (active) setError(e instanceof ApiError ? e.message : 'Something went wrong while loading this page.');
    }).finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [path, refreshIndex]);
  return { data, setData, loading, error, reload };
}
