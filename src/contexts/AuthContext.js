// src/AuthContext.js
import React, { createContext, useContext, useState } from 'react';
import jwt from 'jsonwebtoken'; // Import jsonwebtoken

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState({
    isAuthenticated: false,
    role: null,
    token: null,
  });

  const login = (userData) => {
    console.log("AuthContext login called with:", userData);
    setUser({
      isAuthenticated: true,
      role: userData.role,
      token: userData.token,
    });
    localStorage.setItem('token', userData.token);
  };

  const logout = () => {
    console.log("AuthContext logout called");
    setUser({ isAuthenticated: false, role: null, token: null });
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    localStorage.removeItem("selectedWorkspace");
    localStorage.removeItem("enteredWorkspaceName");
  };

  const isTokenExpired = (token) => {
    try {
      const decoded = jwt.decode(token);
      if (!decoded || !decoded.exp) return true;
      
      const currentTime = Date.now() / 1000;
      return decoded.exp < currentTime;
    } catch (error) {
      return true;
    }
  };

  const checkAuthOnLoad = () => {
    const token = localStorage.getItem("token");
    const userData = localStorage.getItem("user");
    
    if (!token) {
      setUser({ isAuthenticated: false, role: null, token: null });
      return;
    }

    // Check if token is expired
    if (isTokenExpired(token)) {
      console.log("Token expired, logging out user");
      logout();
      return;
    }

    try {
      const decoded = jwt.decode(token); // Decode the token (no need for secret here)

      if (decoded && decoded.role) {
        setUser({
          isAuthenticated: true,
          role: decoded.role,
          token: token,
        });
      } else if (userData) {
        // Fallback to user data from localStorage if token doesn't have role
        const parsedUser = JSON.parse(userData);
        setUser({
          isAuthenticated: true,
          role: parsedUser.role,
          token: token,
        });
      } else {
        // Token is valid but doesn't contain a role, or is otherwise unexpected
        setUser({
          isAuthenticated: true,
          role: null,
          token: token,
        });
      }
    } catch (error) {
      // Token is invalid
      console.error('Invalid token:', error);
      logout();
    }
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, checkAuthOnLoad }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}