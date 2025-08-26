import isLoggedIn from "@/hooks/useAuth";
import React, { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";

interface PublicRouteProps {
  children: React.ReactNode;
}

const PublicRoute = ({ children }: PublicRouteProps) => {
  const [loading, setLoading] = useState<boolean>(false);
  const [loggedIn, setLoggedIn] = useState<boolean>(false);

  useEffect(() => {
    setLoading(true);
    const checkLogin = async () => {
      const user = await isLoggedIn();
      setLoggedIn(!!user);
      setLoading(false);
    };
    checkLogin();
  }, []);

  if (loading) return null;

  if (loggedIn) {
    return <Navigate to="/dashboard" replace />;
  }

  return <>{children}</>;
};

export default PublicRoute;
