import React, { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRole?: string;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  children,
  requiredRole,
}) => {
  const [isValid, setIsValid] = useState<boolean | null>(null);
  const [hasChecked, setHasChecked] = useState(false);

  useEffect(() => {
    if (hasChecked) return; // Only validate once per mount

    const validateUser = () => {
      const token = localStorage.getItem("token");
      const userRole = localStorage.getItem("role");

      // ❌ No token OR no role → force login
      if (!token || !userRole) {
        setIsValid(false);
        setHasChecked(true);
        return;
      }

      // ✅ Token exists and role exists - allow access
      console.log("✅ User authenticated with role:", userRole);

      // ✅ Role check
      if (requiredRole) {
        const hasAccess =
          userRole.toLowerCase() === requiredRole.toLowerCase() ||
          userRole.toLowerCase() === "admin";

        setIsValid(hasAccess);
      } else {
        setIsValid(true);
      }
      setHasChecked(true);
    };

    validateUser();
  }, []);

  // ⏳ While checking auth
  if (isValid === null) {
    return (
      <div
        style={{
          height: "100vh",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          fontSize: "18px",
        }}
      >
        Checking authentication...
      </div>
    );
  }

  // ❌ Not authorized → go to login
  if (!isValid) {
    return <Navigate to="/login" replace />;
  }

  // ✅ Authorized → render page
  return <>{children}</>;
};

export default ProtectedRoute;