import React from "react";
import ReactDOM from "react-dom/client";
import "./index.css";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import LoginPage from "./pages/LoginPage.tsx";
import { Toaster } from "sonner";
import App from "./App.tsx";
import SignUpPage from "./pages/SignUpPage.tsx";
import AuthLayout from "./pages/layout/AuthLayout.tsx";
import DashboardPage from "./pages/DashboardPage.tsx";
import PublicRoute from "./routes/PublicRoute.tsx";
import ProfilePage from "./pages/settings/ProfilePage.tsx";
import PasswordPage from "./pages/settings/PasswordPage.tsx";
import NotFoundPage from "./pages/NotFoundPage.tsx";

const root = document.getElementById("root") as HTMLElement;

const publicRoute = [
  { path: "/", element: <App /> },
  { path: "/login", element: <LoginPage /> },
  { path: "/signup", element: <SignUpPage /> },
];

ReactDOM.createRoot(root).render(
  <BrowserRouter>
    <Toaster duration={2000} position="top-right" />
    <Routes>
      {publicRoute.map(({ path, element }) => (
        <Route
          path={path}
          element={<PublicRoute>{element}</PublicRoute>}
          key={path}
        />
      ))}
      <Route path="/signup" element={<SignUpPage />} />
      <Route element={<AuthLayout />}>
        <Route path="/dashboard" element={<DashboardPage />} />
        <Route path="/settings/profile" element={<ProfilePage />} />
        <Route path="/settings/password" element={<PasswordPage />} />
      </Route>

      <Route path="*" element={<NotFoundPage />} />
      {/* <Route path="/test" element={<h2>Halo ini adalah test</h2>} /> */}
    </Routes>
  </BrowserRouter>
);
