import React from "react";
import { Navigate } from "react-router-dom";

interface Props {
  allowedRoles: string[];
  children: React.ReactNode;
}

const AuthorizedRoute: React.FC<Props> = ({ allowedRoles, children }) => {
  const token = localStorage.getItem("token");
  const role = localStorage.getItem("role");

  // ❗ FIRST check token
  if (!token) {
    return <Navigate to="/" replace />;
  }

  // ❗ THEN check role
  if (!role) {
    return (
      <div style={{ padding: 20, textAlign: 'center' }}>
        <p>Please login again, role not found.</p>
        <button onClick={() => { localStorage.clear(); window.location.href = '/'; }}>
          Logout and Go to Login
        </button>
      </div>
    );
  }

  if (!allowedRoles.some(r => r.toLowerCase() === role.toLowerCase())) {
    return (
      <div style={{ padding: 20, textAlign: 'center' }}>
        <p>Access denied. Your role ({role}) is not authorized for this page.</p>
        <button onClick={() => { localStorage.clear(); window.location.href = '/'; }}>
          Logout and Go to Login
        </button>
      </div>
    );
  }

  return <>{children}</>;
};

export default AuthorizedRoute;