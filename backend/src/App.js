import { BrowserRouter, Routes, Route } from "react-router-dom";
import LoginSignup from "./componnents/loginSingup/loginSignup";
import Users from "./componnents/Admin/users";
import Teams from "./componnents/Admin/teams";
import Matches from "./componnents/Admin/matches";
import User from "./componnents/user/user";
import "./styles/theme.css";
import { useEffect } from "react";
import axios from "axios";


function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LoginSignup />} />
        <Route path="/admin/users" element={<Users />} />
        <Route path="/admin/teams" element={<Teams />} />
        <Route path="/admin/matches" element={<Matches />} />
        <Route path="/user/user" element={<User />} />
        
      </Routes>
    </BrowserRouter>
  );
}

export default App;