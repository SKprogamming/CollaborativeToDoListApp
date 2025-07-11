// src/SharedLists.js
import { useEffect, useState } from "react";
import { db } from "./firebase";
import { collection, query, where, getDocs } from "firebase/firestore";
import { Link } from "react-router-dom";

export const SharedLists = ({ user }) => {
  const [sharedLists, setSharedLists] = useState([]);

  const fetchSharedLists = async () => {
    const q = query(
      collection(db, "todoLists"),
      where("collaborators", "array-contains", user.email)
    );
    const snap = await getDocs(q);
    setSharedLists(snap.docs.map((doc) => ({ id: doc.id, ...doc.data() })));
  };

  useEffect(() => {
    if (user) fetchSharedLists();
  }, [user]);

  return (
    <div className="container">
      <h2>🤝 Shared With Me</h2>

      {sharedLists.length === 0 ? (
        <p>No lists shared with you yet.</p>
      ) : (
        <ul style={{ paddingLeft: "0" }}>
          {sharedLists.map((list) => (
            <li
              key={list.id}
              style={{
                marginBottom: "10px",
                listStyle: "none",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                background: "#eef6ff",
                padding: "10px",
                borderRadius: "6px",
              }}
            >
              <Link
                to={`/list/${list.id}`}
                style={{ textDecoration: "none", flex: 1 }}
              >
                📄 {list.title}
              </Link>
              <span style={{ fontSize: "12px", color: "#555" }}>
                👤 {list.ownerId}
              </span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};
