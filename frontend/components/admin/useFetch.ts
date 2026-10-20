"use client";

import { useCallback, useEffect, useState } from "react";
import { adminApi } from "@/lib/adminApi";

/** Load an admin API resource; `reload()` refetches without blanking current data. */
export function useFetch<T>(path: string | null) {
  const [data, setData] = useState<T | null>(null);
  const [version, setVersion] = useState(0);
  useEffect(() => {
    if (!path) return;
    let alive = true;
    adminApi
      .get<T>(path)
      .then((d) => alive && setData(d))
      .catch(() => {});
    return () => {
      alive = false;
    };
  }, [path, version]);
  const reload = useCallback(() => setVersion((v) => v + 1), []);
  return { data, setData, reload, loading: data === null };
}
