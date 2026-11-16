import { Component } from "react";

export default class ErrorBoundary extends Component {
  state = { error: null };

  static getDerivedStateFromError(error) {
    return { error };
  }

  componentDidCatch(error, info) {
    console.error("FindIt xatosi:", error, info);
  }

  render() {
    if (!this.state.error) return this.props.children;
    return (
      <div className="container page" style={{ minHeight: "70vh", justifyContent: "center", alignItems: "flex-start" }}>
        <h1 className="page-title">Nimadir noto'g'ri ketdi</h1>
        <p className="muted" style={{ margin: 0 }}>Sahifani yangilab ko'ring. Muammo takrorlansa, administratorga xabar bering.</p>
        <div className="row">
          <button className="btn btn-primary" onClick={() => window.location.reload()}>Sahifani yangilash</button>
          <a href="/" className="btn btn-outline">Bosh sahifaga</a>
        </div>
      </div>
    );
  }
}