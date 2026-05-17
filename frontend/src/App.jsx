import React, { useEffect, useState } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { useAuthStore } from "./utils/store";
import { authAPI } from "./utils/api";
import { Toaster } from "react-hot-toast";

import Navbar from "./components/Navbar";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Notes from "./pages/Notes";
import NoteEditor from "./pages/NoteEditor";
import Dashboard from "./pages/Dashboard";
import SharedNote from "./pages/SharedNote";

const ProtectedRoute = ({ children }) => {
  const { isAuthenticated } = useAuthStore();
  return isAuthenticated ? children : <Navigate to="/login" />;
};

const PublicAuthRoute = ({ children }) => {
  const { isAuthenticated } = useAuthStore();
  return isAuthenticated ? <Navigate to="/dashboard" /> : children;
};

function App() {
  const [authLoading, setAuthLoading] = useState(true);
  const { user, setAuth, logout, isAuthenticated } = useAuthStore();

  useEffect(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem("accessToken");
      if (token) {
        try {
          const response = await authAPI.getCurrentUser();
          const currentUser = response.data.data;
          localStorage.setItem("user", JSON.stringify(currentUser));
          setAuth(currentUser, token);
        } catch (error) {
          localStorage.removeItem("accessToken");
          localStorage.removeItem("user");
          logout();
        }
      } else {
        logout();
      }
      setAuthLoading(false);
    };

    checkAuth();
  }, [setAuth, logout]);

  const handleLogout = async () => {
    try {
      await authAPI.logout();
    } catch (error) {
      console.error("Logout error:", error);
    }
    localStorage.removeItem("accessToken");
    localStorage.removeItem("user");
    logout();
  };

  if (authLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50">
        Loading...
      </div>
    );
  }

  return (
    <Router>
      <Toaster position="top-right" />
      {isAuthenticated && (
        <Navbar user={user} onLogout={handleLogout} />
      )}

      <Routes>
        {/* Public Routes */}
        <Route
          path="/login"
          element={
            <PublicAuthRoute>
              <Login />
            </PublicAuthRoute>
          }
        />
        <Route
          path="/register"
          element={
            <PublicAuthRoute>
              <Register />
            </PublicAuthRoute>
          }
        />
        <Route path="/share/:shareToken" element={<SharedNote />} />

        {/* Protected Routes */}
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/notes"
          element={
            <ProtectedRoute>
              <Notes />
            </ProtectedRoute>
          }
        />
        <Route
          path="/notes/create"
          element={
            <ProtectedRoute>
              <NoteEditor />
            </ProtectedRoute>
          }
        />
        <Route
          path="/notes/:noteId"
          element={
            <ProtectedRoute>
              <NoteEditor />
            </ProtectedRoute>
          }
        />

        {/* Default Redirect */}
        <Route
          path="/"
          element={<Navigate to={isAuthenticated ? "/dashboard" : "/login"} />}
        />
      </Routes>
    </Router>
  );
}

export default App;
