import React from "react";
import ReactDOM from "react-dom/client";
import './index.css'
import { BrowserRouter, Route, Routes } from'react-router-dom'
import LoginPage from "./pages/LoginPage.tsx";
import { Toaster } from "sonner";


const root = document.getElementById("root") as HTMLElement;
 
ReactDOM.createRoot(root).render(
  <BrowserRouter>
  <Toaster duration={2000} position="top-right" />
  <Routes>
    <Route path="/login" element={<LoginPage />} />
  </Routes>
  </BrowserRouter>
);
