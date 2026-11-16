import { useEffect, useState } from "react";
import { api } from "../api/client.js";

let cache = null;
export function resetCatalog() {
  cache = null;
}

export default function useCatalog() {
  const [state, setState] = useState(cache || { categories: [], places: [], ready: false });

  useEffect(() => {
    if (cache) return;
    let alive = true;
    Promise.all([api.get("/categories/"), api.get("/places/")])
      .then(([c, p]) => {
        cache = {
          categories: Array.isArray(c) ? c : c.results || [],
          places: Array.isArray(p) ? p : p.results || [],
          ready: true,
        };
        if (alive) setState(cache);
      })
      .catch(() => { if (alive) setState({ categories: [], places: [], ready: true }); });
    return () => { alive = false; };
  }, []);

  return state;
}