// TodoList.js
// ✅ This version is optimized for a clean mobile/iPhone experience

import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { db } from "./firebase";
import {
  doc,
  getDoc,
  updateDoc,
  collection,
  addDoc,
  onSnapshot,
  arrayRemove,
} from "firebase/firestore";
import { Header } from "./Header";

export const TodoList = ({ user }) => {
  const { id: listIdFromURL } = useParams();
  const [task, setTask] = useState("");
  const [tasks, setTasks] = useState([]);
  const [selectedIds, setSelectedIds] = useState([]);
  const [listId, setListId] = useState(null);
  const [canEdit, setCanEdit] = useState(false);
  const [inviteEmail, setInviteEmail] = useState("");
  const [newListTitle, setNewListTitle] = useState("");
  const [collaborators, setCollaborators] = useState([]);

  useEffect(() => {
    if (!user || !listIdFromURL) return;

    const ref = doc(db, "todoLists", listIdFromURL);
    const unsubscribe = onSnapshot(ref, (snap) => {
      if (!snap.exists()) {
        alert("❌ List not found.");
        return;
      }

      const data = snap.data();
      setListId(listIdFromURL);
      setTasks(data.tasks || []);
      setCollaborators(data.collaborators || []);

      const isOwner = user.email === data.ownerId;
      const isCollaborator = data.collaborators?.includes(user.email);
      setCanEdit(isOwner || isCollaborator);

      if (!isOwner && !isCollaborator) {
        alert("🔒 You are in read-only mode.");
      }
    });

    return () => unsubscribe();
  }, [listIdFromURL, user]);

  const createList = async () => {
    if (!user || !newListTitle.trim()) {
      alert("Please enter a title for the list");
      return;
    }

    try {
      const docRef = await addDoc(collection(db, "todoLists"), {
        title: newListTitle.trim(),
        ownerId: user.email,
        collaborators: [],
        tasks: [],
      });

      setListId(docRef.id);
      setTasks([]);
      setCanEdit(true);
      setNewListTitle("");
      alert("✅ List created with ID: " + docRef.id);
    } catch (error) {
      console.error("Error creating list:", error);
      alert("❌ Failed to create list.");
    }
  };

  const syncTasksToFirestore = async (updatedTasks) => {
    if (!listId) return;
    try {
      await updateDoc(doc(db, "todoLists", listId), { tasks: updatedTasks });
    } catch (err) {
      console.error("Sync error:", err);
    }
  };

  const addTask = () => {
    if (!canEdit || task.trim() === "") return;
    const newTask = { id: Date.now(), text: task.trim(), done: false };
    const updatedTasks = [...tasks, newTask];
    setTasks(updatedTasks);
    setTask("");
    syncTasksToFirestore(updatedTasks);
  };

  const toggleDone = (id) => {
    if (!canEdit) return;
    const updatedTasks = tasks.map((t) =>
      t.id === id ? { ...t, done: !t.done } : t
    );
    setTasks(updatedTasks);
    syncTasksToFirestore(updatedTasks);
  };

  const toggleSelect = (id) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  const deleteSelected = () => {
    if (!canEdit) return;
    const updatedTasks = tasks.filter((t) => !selectedIds.includes(t.id));
    setTasks(updatedTasks);
    setSelectedIds([]);
    syncTasksToFirestore(updatedTasks);
  };

  const markSelectedDone = () => {
    if (!canEdit) return;
    const updatedTasks = tasks.map((t) =>
      selectedIds.includes(t.id) ? { ...t, done: true } : t
    );
    setTasks(updatedTasks);
    setSelectedIds([]);
    syncTasksToFirestore(updatedTasks);
  };

  const inviteCollaborator = async () => {
    if (!listId || !inviteEmail || !inviteEmail.includes("@")) {
      alert("Enter a valid email to invite");
      return;
    }

    try {
      const ref = doc(db, "todoLists", listId);
      const snap = await getDoc(ref);
      const data = snap.data();

      const updatedCollaborators = Array.from(
        new Set([...(data.collaborators || []), inviteEmail])
      );
      await updateDoc(ref, { collaborators: updatedCollaborators });
      setInviteEmail("");
      alert(`✅ ${inviteEmail} added as collaborator!`);
    } catch (err) {
      console.error("Error inviting:", err);
      alert("❌ Could not invite");
    }
  };

  const removeCollaborator = async (email) => {
    if (!listId) return;
    try {
      const ref = doc(db, "todoLists", listId);
      await updateDoc(ref, {
        collaborators: arrayRemove(email),
      });
      alert(`❌ Removed ${email}`);
    } catch (err) {
      console.error("Remove collaborator error:", err);
    }
  };

  const pendingTasks = tasks.filter((t) => !t.done);
  const doneTasks = tasks.filter((t) => t.done);

  return (
    <div
      style={{
        maxWidth: "600px",
        margin: "10px auto",
        padding: "10px",
        fontFamily: "Arial",
      }}
    >
      {/* <Header user={user} /> */}
      <h2>📝 To-Do List</h2>

      {!listId && (
        <div>
          <input
            type="text"
            value={newListTitle}
            placeholder="New list title..."
            onChange={(e) => setNewListTitle(e.target.value)}
            style={{ width: "100%", padding: "10px", marginBottom: "10px" }}
          />
          <button onClick={createList} style={{ width: "100%" }}>
            ➕ Create List
          </button>
        </div>
      )}

      {listId && (
        <>
          <div style={{ marginTop: "20px" }}>
            <input
              type="text"
              placeholder="Enter a task..."
              value={task}
              onChange={(e) => setTask(e.target.value)}
              disabled={!canEdit}
              style={{ width: "100%", padding: "8px" }}
            />
            <button
              onClick={addTask}
              disabled={!canEdit}
              style={{ width: "100%", marginTop: "10px" }}
            >
              ➕ Add Task
            </button>

            {selectedIds.length > 0 && (
              <div style={{ marginTop: "10px" }}>
                <button onClick={markSelectedDone}>✔️ Mark Done</button>
                <button onClick={deleteSelected} style={{ marginLeft: "10px" }}>
                  🗑 Delete
                </button>
              </div>
            )}

            <h3 style={{ marginTop: "20px" }}>📋 Pending</h3>
            <ul style={{ listStyle: "none", padding: 0 }}>
              {pendingTasks.map((t) => (
                <li
                  key={t.id}
                  style={{
                    background: "#f5f5f5",
                    padding: "8px",
                    marginBottom: "6px",
                    borderRadius: "5px",
                  }}
                >
                  <input
                    type="checkbox"
                    checked={selectedIds.includes(t.id)}
                    onChange={() => toggleSelect(t.id)}
                  />
                  <span style={{ marginLeft: "10px" }}>{t.text}</span>
                  {canEdit && (
                    <button
                      onClick={() => toggleDone(t.id)}
                      style={{ float: "right" }}
                    >
                      ✅
                    </button>
                  )}
                </li>
              ))}
            </ul>

            <h3>✅ Completed</h3>
            <ul style={{ listStyle: "none", padding: 0 }}>
              {doneTasks.map((t) => (
                <li
                  key={t.id}
                  style={{
                    background: "#d0ffd0",
                    padding: "8px",
                    marginBottom: "6px",
                    borderRadius: "5px",
                  }}
                >
                  <input
                    type="checkbox"
                    checked={selectedIds.includes(t.id)}
                    onChange={() => toggleSelect(t.id)}
                  />
                  <s style={{ marginLeft: "10px" }}>{t.text}</s>
                  {canEdit && (
                    <button
                      onClick={() => toggleDone(t.id)}
                      style={{ float: "right" }}
                    >
                      🔁
                    </button>
                  )}
                </li>
              ))}
            </ul>

            <div style={{ marginTop: "20px" }}>
              <input
                type="email"
                placeholder="Invite collaborator"
                value={inviteEmail}
                onChange={(e) => setInviteEmail(e.target.value)}
                style={{ width: "70%", padding: "8px" }}
              />
              <button
                onClick={inviteCollaborator}
                style={{ marginLeft: "10px" }}
              >
                🔗 Share
              </button>
            </div>

            <div style={{ marginTop: "10px" }}>
              <h4>👥 Collaborators</h4>
              <ul>
                {collaborators.map((email) => (
                  <li key={email}>
                    {email}{" "}
                    {email !== user.email && (
                      <button
                        onClick={() => removeCollaborator(email)}
                        style={{ marginLeft: "10px", color: "red" }}
                      >
                        ❌ Remove
                      </button>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </>
      )}
    </div>
  );
};
