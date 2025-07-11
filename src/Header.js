// src/Header.js
import { Link, useNavigate } from "react-router-dom";
import { signOut } from "firebase/auth";
import { auth } from "./firebase";

export const Header = ({ user }) => {
  const navigate = useNavigate();

  const handleLogout = () => {
    signOut(auth)
      .then(() => {
        alert("Logged out");
        navigate("/");
      })
      .catch((err) => {
        alert("Logout failed");
        console.error(err);
      });
  };

  if (!user) return null;

  return (
    <div
      style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        padding: "15px 30px",
        backgroundColor: "#f0f0f0",
        borderBottom: "1px solid #ccc",
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: "20px" }}>
        <Link to="/">
          <div style={{ fontSize: "20px", fontWeight: "bold" }}>📝</div>
        </Link>
        <Link to="/MyLists">My Lists</Link>
        <Link to="/SharedLists">Shared Lists</Link>
      </div>

      <div style={{ display: "flex", gap: "15px", alignItems: "center" }}>
        <span style={{ fontSize: "14px", color: "#666" }}>
          {user.displayName || user.email}
        </span>
        <button onClick={handleLogout} style={{ padding: "4px 8px" }}>
          Logout
        </button>
      </div>
    </div>
  );
};
