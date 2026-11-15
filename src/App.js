import { BrowserRouter, Routes, Route } from "react-router-dom";
import LoginSignup from "./componnents/loginSingup/loginSignup";
import Users from "./componnents/Admin/users";
import Teams from "./componnents/Admin/teams";
import Matches from "./componnents/Admin/matches";
import User from "./componnents/user/user";
import "./styles/theme.css";
import { useEffect } from "react";
import axios from "axios";
import ProtectedRoute from "./ProtectedRoute";


function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LoginSignup />} />
        <Route path="/admin/users" element={<ProtectedRoute><Users /></ProtectedRoute>} />
        <Route path="/admin/teams" element={<ProtectedRoute><Teams /></ProtectedRoute>} />
        <Route path="/admin/matches" element={<ProtectedRoute><Matches /></ProtectedRoute>} />
        <Route path="/user/user" element={<ProtectedRoute><User /></ProtectedRoute>} />
        
      </Routes>
    </BrowserRouter>
  );
}

export default App;