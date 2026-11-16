import { useEffect, useState } from "react";
import { fetchAllPosts } from "../api/posts.js";
import PostMap from "../components/PostMap.jsx";
import "./Search.css";

export default function MapPage() {
  const [type, setType] = useState("");
  const [posts, setPosts] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    let alive = true;
    setPosts(null);
    setError("");
    fetchAllPosts({ type, ordering: "-created_at" })
      .then((d) => alive && setPosts(d))
      .catch((e) => alive && setError(e.message));
    return () => { alive = false; };
  }, [type]);

  const withCoords = posts ? posts.filter((p) => p.latitude != null).length : 0;

  return (
    <div className="container page">
      <div className="row">
        <h1 className="page-title">Xarita</h1>
        <span className="spacer" />
        <div className="seg view-seg">
          {[["", "Hammasi"], ["lost", "Yo'qolgan"], ["found", "Topilgan"]].map(([v, l]) => (
            <button key={v} type="button" className={type === v ? "on" : ""} onClick={() => setType(v)}>{l}</button>
          ))}
        </div>
      </div>
      {error && <div className="alert alert-error">{error}</div>}
      <div className="muted">{posts ? `${withCoords} ta e'lon xaritada` : "Yuklanmoqda..."}</div>
      <PostMap posts={posts || []} height="calc(100vh - 280px)" />
    </div>
  );
}