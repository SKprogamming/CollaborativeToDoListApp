// src/Login.js
import { useState } from "react";
import { auth } from "./firebase";
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider,
} from "firebase/auth";

export const LoginPg = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  // Email/Password login
  const handleLogin = () => {
    signInWithEmailAndPassword(auth, email, password)
      .then(() => alert("Logged in!"))
      .catch((error) => alert("Login error: " + error.message));
  };

  // Email/Password signup
  const handleRegister = () => {
    createUserWithEmailAndPassword(auth, email, password)
      .then(() => alert("User registered!"))
      .catch((error) => alert("Signup error: " + error.message));
  };

  // Google Login
  const handleGoogleLogin = () => {
    const provider = new GoogleAuthProvider();
    provider.setCustomParameters({
      prompt: "select_account", // ensures account selector shows
    });

    signInWithPopup(auth, provider)
      .then(() => alert("✅ Google login successful!"))
      .catch((error) => {
        console.error("Google login error:", error);
        alert("❌ Google login error: " + error.message);
      });
  };

  return (
    <div style={{ padding: "20px" }}>
      <h2>Login / Register</h2>

      <input
        type="email"
        placeholder="Email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
      />
      <br />
      <br />
      <input
        type="password"
        placeholder="Password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
      />
      <br />
      <br />
      <button onClick={handleLogin}>Log In</button>
      <button onClick={handleRegister}>Register</button>
      <hr />
      <button onClick={handleGoogleLogin}>Sign in with Google</button>
    </div>
  );
};
