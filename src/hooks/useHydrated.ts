import { useEffect, useState } from "react";

// Persisted stores only exist in the browser: wait for the first client render before showing them.
export function useHydrated() {
  const [hydrated, setHydrated] = useState(false);
  useEffect(() => setHydrated(true), []);
  return hydrated;
}
