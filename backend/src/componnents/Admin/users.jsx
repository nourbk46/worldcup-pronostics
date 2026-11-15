import React, { useState, useEffect } from "react";
import "./Sidebar.css";
import Sidebar from "./Sidebar";
import backg from "../Assets/backg.png";
import logo from "../Assets/logo.png";
import "./users.css";
const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';


const Users = () => {
  // États
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [users, setUsers] = useState([]); // <-- Ajouté
  const [formData, setFormData] = useState({
    login: "",
    password: "",
    score: "0",
    role: "user"
  });

  // Fonction pour récupérer les utilisateurs depuis .NET
 const fetchUsers = async () => {
  try {
    console.log("Tentative de connexion à:", `${API_URL}/api/users`);
    const response = await fetch(`${API_URL}/api/users`);
    if (!response.ok) {
      console.log("Erreur HTTP:", response.status, response.statusText);
      const text = await response.text();
      console.log("Réponse erreur:", text);
      throw new Error(`Erreur HTTP: ${response.status}`);
    }
    
    const data = await response.json();
    console.log("Données reçues:", data);
    setUsers(data);
  } catch (error) {
    console.log("Erreur complète:", error);
    alert(`Erreur de connexion: ${error.message}`);
  }
};
  // Appeler l'API quand la page charge
  useEffect(() => {
    fetchUsers();
  }, []);

  // Fonctions pour gérer le modal
  const handleOpenModal = () => {
    setEditingId(null);
    setFormData({
      login: "",
      password: "",
      score: "0",
      role: "user"
    });
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingId(null);
    setFormData({
      login: "",
      password: "",
      score: "0",
      role: "user"
    });
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };

  // Fonction pour soumettre le formulaire (ajout/édition)
const handleSubmit = async (e) => {
  e.preventDefault();
  
  console.log("Données du formulaire:", formData);
  
  try {
    // Utilisez les mêmes noms de propriétés que dans CreateUserDto
    const userData = {
      login: formData.login, // minuscule comme dans le DTO
      password: formData.password,
      score: parseInt(formData.score) || 0,
      role: formData.role
    };

    console.log("Données envoyées à l'API:", userData);

    const url = editingId 
      ? `${API_URL}/api/users/${editingId}`
      : `${API_URL}/api/users`;
    const method = editingId ? 'PUT' : 'POST';

    const response = await fetch(url, {
      method: method,
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(userData),
    });

    console.log("Status de la réponse:", response.status);
    
    if (!response.ok) {
      const errorData = await response.json();
      console.log("Erreur de l'API:", errorData);
      throw new Error(errorData.message || `Erreur ${response.status}`);
    }

    // Rafraîchir la liste
    fetchUsers();
    handleCloseModal();
    
    alert(`Utilisateur "${formData.login}" ${editingId ? 'modifié' : 'ajouté'} avec succès!`);

  } catch (error) {
    console.error('Erreur complète:', error);
    alert(`Erreur: ${error.message}`);
  }
};



  // Fonction pour supprimer un utilisateur
  const handleDeleteUser = async (id) => {
  if (!window.confirm("Êtes-vous sûr de vouloir supprimer cet utilisateur ?")) {
    return;
  }

  try {
    console.log(`Tentative de suppression de l'utilisateur ${id}`);
    
    const response = await fetch(`${API_URL}/api/users/${id}`, {
      method: 'DELETE',
    });

    console.log("Réponse DELETE:", {
      status: response.status,
      statusText: response.statusText,
      ok: response.ok
    });

    if (response.status === 204) {
      // 204 No Content = succès
      console.log("Suppression réussie (204)");
      await fetchUsers();
      alert("✅ Utilisateur supprimé avec succès!");
      return;
    }

    // Si erreur, lire le message
    let errorMessage = `Erreur ${response.status}`;
    
    try {
      const errorData = await response.json();
      console.error("Erreur API (JSON):", errorData);
      errorMessage = errorData.message || errorData.error || errorMessage;
      
      if (errorData.details) {
        errorMessage += `\nDétails: ${errorData.details}`;
      }
    } catch (jsonError) {
      // Si pas du JSON, lire comme texte
      const errorText = await response.text();
      console.error("Erreur API (texte):", errorText);
      errorMessage = errorText || errorMessage;
    }

    alert(`❌ ${errorMessage}`);

  } catch (error) {
    console.error('💥 Erreur réseau:', error);
    alert('❌ Erreur de connexion au serveur. Vérifiez que .NET est démarré.');
  }
};
  // Fonction pour modifier un utilisateur
  const handleEditUser = (id) => {
    const userToEdit = users.find(user => user.id === id);
    if (userToEdit) {
      setFormData({
        login: userToEdit.login || userToEdit.nom, // Support les deux formats
        password: "", // Mot de passe vide pour l'édition
        score: userToEdit.score.toString(),
        role: userToEdit.role || "user"
      });
      setEditingId(id);
      setShowModal(true);
    }
  };

  return (
    <div className="admin-layout">
      <Sidebar />
      <div className="admin-main">
        <div className="admin-content">
          <div className="back-image">
            <img src={backg} alt="background" />
            <div className="logo-overlay">
              <img src={logo} alt="Neosys Logo" className="logo-right" />
            </div>
            <div className="image-text-content">
              <h1 className="image-title">Challenge Pronostics AFCON - Neosys</h1>
              <p className="image-subtitle">
                A l'occasion du Coupe du monde des Nations , nous lançons un jeu de pronostics interne
                pour allier passion du football et esprit d'équipe.<br></br>
                <strong>Qui sera le meilleur analyste sportif de l'entreprise ?</strong>
              </p>
            </div>
          </div>
          
          <div className="content-wrapper">
            {/* Section Titre + Bouton Ajouter */}
            <div className="section-header">
              <h3 className="section-title">Liste des utilisateurs</h3>
              <button className="btn-add" onClick={handleOpenModal}>
                <span className="btn-icon">➕</span>
                Ajouter utilisateur
              </button>
            </div>
            
            <div className="white-table-container">
              <table className="users-table">
                <thead>
                  <tr>
                    <th>Login</th>
                    <th>Score</th>
                    <th>Rôle</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((user) => (
                    <tr key={user.id}>
                      <td>{user.login || user.nom}</td>
                      <td>{user.score}</td>
                      <td>{user.role}</td>
                      <td className="actions-cell">
                        <button 
                          className="btn-modify-icon" 
                          title="Modifier"
                          onClick={() => handleEditUser(user.id)}
                        >
                          ✏️
                        </button>
                        <button 
                          className="btn-delete-icon" 
                          title="Supprimer"
                          onClick={() => handleDeleteUser(user.id)}
                        >
                          🗑️
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

      {/* Modal pour ajouter/modifier un utilisateur */}
      {showModal && (
        <div className="modal-overlay" onClick={handleCloseModal}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2 className="modal-title">
                {editingId ? "Modifier l'utilisateur" : "Ajouter un nouvel utilisateur"}
              </h2>
              <button className="modal-close" onClick={handleCloseModal}>
                &times;
              </button>
            </div>
            
            <form className="modal-form" onSubmit={handleSubmit}>
              <div className="form-group">
                <label htmlFor="login">Login *</label>
                <input
                  type="text"
                  id="login"
                  name="login"
                  value={formData.login}
                  onChange={handleInputChange}
                  required
                />
              </div>
              
              <div className="form-group">
                <label htmlFor="password">
                  {editingId ? "Nouveau mot de passe (laisser vide pour ne pas changer)" : "Mot de passe *"}
                </label>
                <input
                  type="password"
                  id="password"
                  name="password"
                  value={formData.password}
                  onChange={handleInputChange}
                  required={!editingId}
                />
              </div>
              
              <div className="form-group">
                <label htmlFor="score">Score</label>
                <input
                  type="number"
                  id="score"
                  name="score"
                  value={formData.score}
                  onChange={handleInputChange}
                  min="0"
                />
              </div>
              
              <div className="form-group">
                <label htmlFor="role">Rôle</label>
                <select
                  id="role"
                  name="role"
                  value={formData.role}
                  onChange={handleInputChange}
                >
                  <option value="user">Utilisateur</option>
                  <option value="admin">Administrateur</option>
                </select>
              </div>
              
              <div className="form-actions">
                <button type="button" className="btn-cancel" onClick={handleCloseModal}>
                  Annuler
                </button>
                <button type="submit" className="btn-submit">
                  {editingId ? "Modifier" : "Ajouter"} utilisateur
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Users;