import { useState } from "react";
import SmartLabTracker from "./SmartLabTracker";
import AdminDashboard from "./AdminDashboard";

/*
  Root App — toggles between Student View and Admin Dashboard.
  In production, replace the toggle with real Spring Boot JWT auth.

  Usage in main.jsx / index.js:
    import App from "./App";
    ReactDOM.createRoot(document.getElementById("root")).render(<App />);
*/
export default function App() {
  const [view, setView] = useState("student"); // "student" | "admin"
  const [role, setRole] = useState("student");
  const [showLogin, setShowLogin] = useState(false);
  const [password, setPassword] = useState("");

  return (
    <div className="main-layout">
      {view === "student"
        ? <SmartLabTracker onAdmin={() => setShowLogin(true)} />
        : <AdminDashboard onBack={() => setView("student")} />}

      {showLogin && (
  <div className="sl-overlay open">
    <div className="sl-modal">
      
      <div className="sl-m-head">
        <div className="sl-m-title">Admin Login</div>
        <button className="sl-m-close" onClick={() => setShowLogin(false)}>×</button>
      </div>

      <div className="sl-m-body">
        <input
          className="sl-input"
          type="password"
          placeholder="Enter password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
      </div>

      <div className="sl-m-foot">
        <button className="sl-btn-cancel" onClick={() => setShowLogin(false)}>
          Cancel
        </button>

        <button
          className="sl-btn-submit"
          onClick={() => {
            if (password === "admin123") {
              setView("admin");
              setShowLogin(false);
              setPassword("");
            } else {
              alert("Wrong password");
            }
          }}
        >
          Login
        </button>
      </div>

    </div>
  </div>
)}
    </div>
  );
}

