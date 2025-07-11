// src/MyLists.js
import { useEffect, useState } from "react";
import { db } from "./firebase";
import {
  collection,
  query,
  where,
  getDocs,
  deleteDoc,
  doc,
  addDoc,
} from "firebase/firestore";
import { Link } from "react-router-dom";

export const MyLists = ({ user }) => {
  const [ownLists, setOwnLists] = useState([]);
  const [newListTitle, setNewListTitle] = useState("");

  const fetchOwnLists = async () => {
    const q = query(
      collection(db, "todoLists"),
      where("ownerId", "==", user.email)
    );
    const snap = await getDocs(q);
    setOwnLists(snap.docs.map((doc) => ({ id: doc.id, ...doc.data() })));
  };

  useEffect(() => {
    if (user) fetchOwnLists();
  }, [user]);

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this list?")) return;
    try {
      await deleteDoc(doc(db, "todoLists", id));
      setOwnLists((prev) => prev.filter((l) => l.id !== id));
      alert("✅ List deleted");
    } catch (err) {
      console.error("Delete error:", err);
      alert("❌ Failed to delete");
    }
  };

  const handleCreate = async () => {
    if (!newListTitle.trim()) return alert("List name required!");
    try {
      const docRef = await addDoc(collection(db, "todoLists"), {
        title: newListTitle.trim(),
        ownerId: user.email,
        collaborators: [],
        tasks: [],
      });
      setOwnLists((prev) => [
        ...prev,
        { id: docRef.id, title: newListTitle.trim() },
      ]);
      setNewListTitle("");
      alert("✅ List created!");
    } catch (err) {
      console.error("Create error:", err);
      alert("❌ Failed to create list.");
    }
  };

  return (
    <div className="container">
      <h2>📂 My Lists</h2>

      <div style={{ display: "flex", marginBottom: "15px" }}>
        <input
          type="text"
          value={newListTitle}
          onChange={(e) => setNewListTitle(e.target.value)}
          placeholder="New list name"
          style={{ flex: 1, padding: "8px" }}
        />
        <button onClick={handleCreate} style={{ marginLeft: "10px" }}>
          ➕ Create
        </button>
      </div>

      {ownLists.length === 0 ? (
        <p>You haven’t created any lists yet.</p>
      ) : (
        <ul style={{ paddingLeft: "0" }}>
          {ownLists.map((list) => (
            <li
              key={list.id}
              style={{
                marginBottom: "10px",
                listStyle: "none",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                background: "#f8f8f8",
                padding: "10px",
                borderRadius: "6px",
              }}
            >
              <Link
                to={`/list/${list.id}`}
                style={{ textDecoration: "none", flex: 1 }}
              >
                📋 {list.title}
              </Link>
              <button
                onClick={() => handleDelete(list.id)}
                style={{ marginLeft: "10px", color: "red" }}
              >
                🗑
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};
