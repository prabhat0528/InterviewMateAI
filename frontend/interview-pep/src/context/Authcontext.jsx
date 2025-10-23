import React, { createContext, useState, useEffect } from "react";
import axios from "axios";

// Create Context
export const AuthContext = createContext();

// Axios client
const client = axios.create({
  baseURL: "https://interviewmateai-backend.onrender.com/ai/user",
  withCredentials: true, // allows cookies (session)
});

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Check active session on app start
  useEffect(() => {
    const fetchSession = async () => {
      try {
        const res = await client.get("/session");
        if (res.data.user) {
          setUser(res.data.user);
        }
      } catch (err) {
        console.error("Session fetch error:", err.response?.data || err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchSession();
  }, []);

  // Signup
  const signup = async (name, email, password) => {
    try {
      const res = await client.post("/register", { name, email, password });
      setUser(res.data.user);
      return {response: res, success: true };
    } catch (error) {
      console.error("Signup error:", error.response?.data || error.message);
      return { success: false, message: error.response?.data?.message || "Signup failed" };
    }
  };

  // Login
  const login = async (email, password) => {
    try {
      const res = await client.post("/login", { email, password });
      setUser(res.data.user);
      return { response: res,success: true };
    } catch (error) {
      console.error("Login error:", error.response?.data || error.message);
      return { success: false, message: error.response?.data?.message || "Login failed" };
    }
  };

  // Logout
  const logout = async () => {
    try {
      await client.post("/logout");
      setUser(null);
    } catch (error) {
      console.error("Logout error:", error.response?.data || error.message);
    }
  };

  if (loading) return <p>Loading...</p>;

  return (
    <AuthContext.Provider value={{ user, signup, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};
