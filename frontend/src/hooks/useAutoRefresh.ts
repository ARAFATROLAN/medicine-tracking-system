import { useEffect } from "react";

export const useAutoRefresh = (callback: () => void, interval = 10000) => {
  useEffect(() => {
    callback();
    const id = setInterval(callback, interval);
    return () => clearInterval(id);
  }, [callback, interval]);
};