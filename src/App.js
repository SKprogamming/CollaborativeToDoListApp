// src/App.js
import { useEffect, useState } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { auth } from "./firebase";
import { LoginPg } from "./LoginPg";
import { MyLists } from "./MyLists";
import { SharedLists } from "./SharedLists";
import { TodoList } from "./TodoList";
import { Header } from "./Header";

function App() {
  const [user, setUser] = useState(null);
  const [loadingAuth, setLoadingAuth] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setLoadingAuth(false);
    });
    return () => unsubscribe();
  }, []);

  const handleLogout = () => {
    signOut(auth).then(() => alert("Logged out"));
  };

  if (loadingAuth) {
    return <p style={{ textAlign: "center", marginTop: "40px" }}>Loading...</p>;
  }

  return (
    <Router>
      <div style={{ fontFamily: "Arial" }}>
        {/* ✅ Header is outside Routes so it shows on all pages */}
        {user && <Header onLogout={handleLogout} user={user} />}

        <div style={{ padding: "20px", maxWidth: "700px", margin: "auto" }}>
          <Routes>
            <Route
              path="/"
              element={user ? <MyLists user={user} /> : <LoginPg />}
            />
            <Route
              path="/MyLists"
              element={user ? <MyLists user={user} /> : <Navigate to="/" />}
            />
            <Route
              path="/SharedLists"
              element={user ? <SharedLists user={user} /> : <Navigate to="/" />}
            />
            <Route
              path="/TodoList/:id"
              element={user ? <TodoList user={user} /> : <Navigate to="/" />}
            />
            <Route path="*" element={<p>404 - Page not found</p>} />
          </Routes>
        </div>
      </div>
    </Router>
  );
}

export default App;
