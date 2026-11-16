import { useEffect } from "react";
import { Outlet, useLocation } from "react-router-dom";
import Header from "./Header.jsx";
import Footer from "./Footer.jsx";

const TITLES = [
  ["/posts/new", "E'lon qo'shish"],
  ["/posts", "E'lon"],
  ["/search", "Qidiruv"],
  ["/map", "Xarita"],
  ["/how", "Qanday ishlaydi"],
  ["/login", "Kirish"],
  ["/me/posts", "E'lonlarim"],
  ["/me/claims", "Da'volarim"],
  ["/notifications", "Xabarlar"],
  ["/profile", "Profil"],
  ["/moderation", "Moderator paneli"],
  ["/admin", "Admin paneli"],
];

export default function Layout() {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
    const hit = TITLES.find(([p]) => pathname === p || pathname.startsWith(p + "/"));
    document.title = hit ? `${hit[1]} · FindIt` : "FindIt: yo'qolgan va topilgan buyumlar";
  }, [pathname]);

  return (
    <div className="app">
      <Header />
      <main>
        <Outlet />
      </main>
      <Footer />
    </div>
  );
}