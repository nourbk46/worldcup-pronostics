import React, { useState, useRef, useEffect } from "react";
import "./Sidebar.css";
import logo from "../Assets/logo.png";
import { FaUserCircle } from "react-icons/fa";
import { FiLogOut } from "react-icons/fi";
import { Link } from "react-router-dom";
const Sidebar = () => {
  const [showUserMenu, setShowUserMenu] = useState(false);
  const userMenuRef = useRef(null);
  
   const handleLogout = () => {
  localStorage.clear();
  window.location.replace("/"); 
};


  useEffect(() => {
    const handleClickOutside = (event) => {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target)) {
        setShowUserMenu(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  return (
    <>
      <div className="sidebar">
        <div className="logo-image">
          <img src={logo} alt="logo NEOSYS" />
        </div>
        
        <ul>
          <li> <Link to="/admin/users">Utilisateurs</Link></li>
          <li> <Link to="/admin/teams">Équipes</Link></li>
          <li> <Link to="/admin/matches">Matchs</Link></li>
        </ul>

        {/* Icône utilisateur */}
        <div className="user-menu-container" ref={userMenuRef}>
          <div 
            className="user-icon" 
            onClick={() => setShowUserMenu(!showUserMenu)}
            title="Menu utilisateur"
          >
            <FaUserCircle size={28} />
          </div>
          
          {/* Menu déroulant utilisateur */}
          {showUserMenu && (
            <div className="user-dropdown">
              
              
              <div className="dropdown-divider"></div>
              
              <button className="logout-btn" onClick={handleLogout}>
                <FiLogOut size={18} />
                <span>Déconnexion</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default Sidebar;