import React, { useState, useRef, useEffect } from "react";
import "./SidebarUser.css";
import logo from "../Assets/logo.png";
import { FaUserCircle } from "react-icons/fa";
import { FiLogOut } from "react-icons/fi";
import { Link } from "react-router-dom";
const SidebarUser = () => {
  const [showUserMenu, setShowUserMenu] = useState(false);
  const userMenuRef = useRef(null);
  
  const handleLogout = () => {
    localStorage.removeItem("token");
    window.location.href = "/";
  };

  // Fermer le menu quand on clique en dehors
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
        
       <p className="titre">Application interne reservée aux collaborateurs NEOSYS </p>

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

export default SidebarUser;