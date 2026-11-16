import { Link } from "react-router-dom";
import { mediaUrl } from "../api/client.js";
import { formatDate } from "../lib/format.js";
import { TypeChip } from "./Chips.jsx";
import Icon from "./Icon.jsx";
import "./PostCard.css";

export default function PostCard({ post }) {
  const img = mediaUrl(post.image);
  return (
    <Link to={`/posts/${post.id}`} className="pcard">
      <div className="pcard-img">
        {img ? <img src={img} alt="" loading="lazy" /> : <Icon name="image" size={30} stroke={1.5} color="var(--line-3)" />}
      </div>
      <div className="pcard-body">
        <div className="pcard-top">
          <TypeChip type={post.type} />
          <span className="dim pcard-date">{formatDate(post.event_date)}</span>
        </div>
        <h3 className="pcard-title">{post.title}</h3>
        <div className="muted pcard-place">
          <Icon name="map" size={15} /> <span>{post.place_name || post.location_detail || "Joy ko'rsatilmagan"}</span>
        </div>
      </div>
    </Link>
  );
}