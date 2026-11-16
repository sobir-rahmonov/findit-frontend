import { useCallback, useEffect, useRef, useState } from "react";
import { api } from "../api/client.js";

export default function useQueue(path, params) {
  const key = JSON.stringify(params);
  const paramsRef = useRef(params);
  paramsRef.current = params;

  const [items, setItems] = useState(null);
  const [count, setCount] = useState(0);
  const [next, setNext] = useState(false);
  const [page, setPage] = useState(1);
  const [error, setError] = useState("");
  const [loadingMore, setLoadingMore] = useState(false);

  const fetchPage = useCallback(async (pg, replace) => {
    const d = await api.get(path, { ...paramsRef.current, page: pg });
    setItems((prev) => (replace ? d.results : [...(prev || []), ...d.results]));
    setCount(d.count);
    setNext(!!d.next);
    setPage(pg);
  }, [path]);

  const reload = useCallback(async () => {
    try { await fetchPage(1, true); } catch (e) { setError(e.message); }
  }, [fetchPage]);

  useEffect(() => {
    setItems(null);
    setError("");
    reload();
  }, [key, reload]);

  const more = useCallback(async () => {
    setLoadingMore(true);
    try { await fetchPage(page + 1, false); } catch (e) { setError(e.message); }
    setLoadingMore(false);
  }, [fetchPage, page]);

  return { items, count, next, error, setError, loadingMore, more, reload };
}