import { lazy, Suspense } from "react";
import { Navigate, Route, Routes } from "react-router-dom";
import Layout from "./components/Layout.jsx";
import { RequireAuth, RequireRole } from "./components/Guards.jsx";
import Home from "./pages/Home.jsx";
import Login from "./pages/Login.jsx";
import Search from "./pages/Search.jsx";
import How from "./pages/How.jsx";
import PostDetail from "./pages/PostDetail.jsx";
import MyPosts from "./pages/MyPosts.jsx";
import ClaimForm from "./pages/ClaimForm.jsx";
import MyClaims from "./pages/MyClaims.jsx";
import Notifications from "./pages/Notifications.jsx";
import Profile from "./pages/Profile.jsx";
import NotFound from "./pages/NotFound.jsx";

const MapPage = lazy(() => import("./pages/MapPage.jsx"));
const PostForm = lazy(() => import("./pages/PostForm.jsx"));
const ModerationLayout = lazy(() => import("./pages/moderation/ModerationLayout.jsx"));
const ModPosts = lazy(() => import("./pages/moderation/ModPosts.jsx"));
const ModClaims = lazy(() => import("./pages/moderation/ModClaims.jsx"));
const ModReports = lazy(() => import("./pages/moderation/ModReports.jsx"));
const AdminLayout = lazy(() => import("./pages/admin/AdminLayout.jsx"));
const AdminStats = lazy(() => import("./pages/admin/AdminStats.jsx"));
const AdminUsers = lazy(() => import("./pages/admin/AdminUsers.jsx"));
const AdminCategories = lazy(() => import("./pages/admin/AdminCategories.jsx"));
const AdminPlaces = lazy(() => import("./pages/admin/AdminPlaces.jsx"));
const AdminSettings = lazy(() => import("./pages/admin/AdminSettings.jsx"));

function Fallback() {
  return (
    <div className="center-screen">
      <div className="spinner" />
    </div>
  );
}

export default function App() {
  return (
    <Suspense fallback={<Fallback />}>
      <Routes>
        <Route element={<Layout />}>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/search" element={<Search />} />
          <Route path="/map" element={<MapPage />} />
          <Route path="/how" element={<How />} />
          <Route path="/posts/:id" element={<PostDetail />} />

          <Route element={<RequireAuth />}>
            <Route path="/posts/new" element={<PostForm />} />
            <Route path="/posts/:id/edit" element={<PostForm />} />
            <Route path="/posts/:id/claim" element={<ClaimForm />} />
            <Route path="/me/posts" element={<MyPosts />} />
            <Route path="/me/claims" element={<MyClaims />} />
            <Route path="/notifications" element={<Notifications />} />
            <Route path="/profile" element={<Profile />} />
          </Route>

          <Route element={<RequireRole role="moderator" />}>
            <Route path="/moderation" element={<ModerationLayout />}>
              <Route index element={<Navigate to="posts" replace />} />
              <Route path="posts" element={<ModPosts />} />
              <Route path="claims" element={<ModClaims />} />
              <Route path="reports" element={<ModReports />} />
            </Route>
          </Route>

          <Route element={<RequireRole role="admin" />}>
            <Route path="/admin" element={<AdminLayout />}>
              <Route index element={<Navigate to="stats" replace />} />
              <Route path="stats" element={<AdminStats />} />
              <Route path="users" element={<AdminUsers />} />
              <Route path="categories" element={<AdminCategories />} />
              <Route path="places" element={<AdminPlaces />} />
              <Route path="settings" element={<AdminSettings />} />
            </Route>
          </Route>

          <Route path="*" element={<NotFound />} />
        </Route>
      </Routes>
    </Suspense>
  );
}