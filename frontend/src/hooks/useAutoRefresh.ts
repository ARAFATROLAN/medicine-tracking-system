import { useEffect, useRef, useState, useCallback } from "react";

interface UseAutoRefreshOptions {
  interval?: number; // milliseconds
  enabled?: boolean;
  onError?: (error: Error) => void;
  immediate?: boolean;
}

/**
 * Custom hook for auto-refreshing data with smart polling
 * @param fetchFunction - Async function to fetch data
 * @param options - Configuration options
 * @returns { data, loading, error, refetch }
 */
export const useAutoRefresh = <T,>(
  fetchFunction: () => Promise<T>,
  options: UseAutoRefreshOptions = {}
) => {
  const {
    interval = 5000, // Default 5 seconds
    enabled = true,
    onError,
    immediate = true,
  } = options;

  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(immediate ? true : false);
  const [error, setError] = useState<string | null>(null);
  const intervalRef = useRef<number | null>(null);
  const isMountedRef = useRef(true);

  const refetch = useCallback(async () => {
    try {
      setLoading(true);
      const result = await fetchFunction();
      
      if (isMountedRef.current) {
        setData(result);
        setError(null);
      }
    } catch (err: any) {
      if (isMountedRef.current) {
        const errorMsg = err.message || "Failed to fetch data";
        setError(errorMsg);
        if (onError) onError(err);
      }
      console.error("Auto-refresh error:", err);
    } finally {
      if (isMountedRef.current) {
        setLoading(false);
      }
    }
  }, [fetchFunction, onError]);

  // Initial fetch if immediate is true
  useEffect(() => {
    if (enabled && immediate) {
      refetch();
    }
  }, [enabled, immediate, refetch]);

  // Set up polling interval
  useEffect(() => {
    if (enabled && interval > 0) {
      intervalRef.current = setInterval(() => {
        refetch();
      }, interval);
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [enabled, interval, refetch]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      isMountedRef.current = false;
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, []);

  return { data, loading, error, refetch };
};

/**
 * Legacy hook for backward compatibility
 */
export const useAutoRefreshLegacy = (callback: () => void, interval = 10000) => {
  useEffect(() => {
    callback();
    const id = setInterval(callback, interval);
    return () => clearInterval(id);
  }, [callback, interval]);
};

/**
 * Custom hook for batched auto-refresh of multiple data sources
 * Fetches all data in parallel and updates simultaneously
 */
export const useMultiAutoRefresh = <T extends Record<string, any>>(
  fetchFunctions: { [K in keyof T]: () => Promise<T[K]> },
  options: UseAutoRefreshOptions = {}
) => {
  const { interval = 5000, enabled = true, onError, immediate = true } = options;

  const [data, setData] = useState<Partial<T> | null>(null);
  const [loading, setLoading] = useState(immediate ? true : false);
  const [error, setError] = useState<string | null>(null);
  const intervalRef = useRef<number | null>(null);
  const isMountedRef = useRef(true);

  const refetch = useCallback(async () => {
    try {
      setLoading(true);
      const promises = Object.entries(fetchFunctions).map(
        async ([key, fetchFn]) => {
          try {
            const value = await (fetchFn as any)();
            return { key, value, success: true };
          } catch (err) {
            return { key, value: null, success: false, error: err };
          }
        }
      );

      const results = await Promise.all(promises);
      
      if (isMountedRef.current) {
        const newData = {} as Partial<T>;
        const errors: string[] = [];

        results.forEach(({ key, value, success, error: _err }) => {
          if (success) {
            (newData as any)[key] = value;
          } else {
            errors.push(`Error fetching ${key}`);
          }
        });

        setData(newData);
        setError(errors.length > 0 ? errors.join("; ") : null);
      }
    } catch (err: any) {
      if (isMountedRef.current) {
        const errorMsg = err.message || "Failed to fetch data";
        setError(errorMsg);
        if (onError) onError(err);
      }
    } finally {
      if (isMountedRef.current) {
        setLoading(false);
      }
    }
  }, [fetchFunctions, onError]);

  useEffect(() => {
    if (enabled && immediate) {
      refetch();
    }
  }, [enabled, immediate, refetch]);

  useEffect(() => {
    if (enabled && interval > 0) {
      intervalRef.current = setInterval(() => {
        refetch();
      }, interval);
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [enabled, interval, refetch]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      isMountedRef.current = false;
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, []);

  return { data, loading, error, refetch };
};

/**
 * Custom hook for change detection
 * Detects when data has changed and triggers callbacks
 */
export const useDataChange = <T,>(
  data: T | null,
  onDataChange?: (newData: T, oldData: T | null) => void
): T | null => {
  const prevDataRef = useRef<T | null>(null);

  useEffect(() => {
    if (data && JSON.stringify(data) !== JSON.stringify(prevDataRef.current)) {
      if (onDataChange) {
        onDataChange(data, prevDataRef.current);
      }
      prevDataRef.current = data;
    }
  }, [data, onDataChange]);

  return data;
};