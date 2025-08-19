import React from "react";
import ReactDOM from "react-dom/client";
import './index.css'
import { BrowserRouter, Route, Routes } from'react-router-dom'
import LoginPage from "./pages/LoginPage.tsx";
import { Toaster } from "sonner";
import App from "./App.tsx";
import SignUpPage from "./pages/SignUpPage.tsx";
import AuthLayout from "./pages/layout/AuthLayout.tsx";
import DashboardPage from "./pages/DashboardPage.tsx";


const root = document.getElementById("root") as HTMLElement;
 
ReactDOM.createRoot(root).render(
  <BrowserRouter>
  <Toaster duration={2000} position="top-right" />
  <Routes>
    {/* route sementara landing page */}
    <Route path="/" element={<App />} />
    <Route path="/login" element={<LoginPage />} />
    <Route path="/signup" element={<SignUpPage/>} />
    <Route element={<AuthLayout />}>
      <Route path="/dashboard" element={<DashboardPage/>}/>
    </Route>
  </Routes>
  </BrowserRouter>
);
