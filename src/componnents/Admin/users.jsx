import React, { useState, useEffect } from "react";
import "./Sidebar.css";
import Sidebar from "./Sidebar";
import backg from "../Assets/photoF.jpeg";
import "./users.css";
const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';


const Users = () => {
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [users, setUsers] = useState([]); 
  const [userPasswords, setUserPasswords] = useState({});
  const [formData, setFormData] = useState({
    login: "",
    password: "",
    score: "0",
    role: "user"
  });
 const [showPasswords, setShowPasswords] = useState({}); 

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
      
      const passwordsState = {};
      data.forEach(user => {
        passwordsState[user.id] = false; 
      });
      setShowPasswords(passwordsState);
    } catch (error) {
      console.log("Erreur complète:", error);
    }
  };
  
  useEffect(() => {
    fetchUsers();
  }, []);

  const togglePasswordVisibility = (userId) => {
    setShowPasswords(prev => ({
      ...prev,
      [userId]: !prev[userId]
    }));
  };

  const copyPasswordToClipboard = (password) => {
    navigator.clipboard.writeText(password)
      .then(() => {
      })
      .catch(err => {
        console.error("Erreur lors de la copie:", err);
      });
  };

  const formatPassword = (password, userId) => {
    if (!password) return "Aucun";
    
    if (showPasswords[userId]) {
      return password;
    } else {
      return "•".repeat(Math.min(password.length, 10)); 
    }
  };
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

const handleSubmit = async (e) => {
  e.preventDefault();
  
  console.log("Données du formulaire:", formData);
  
  try {
    const userDataAttempts = [
      {
        Login: formData.login,
        Password: editingId && (!formData.password || formData.password.trim() === '') 
          ? undefined 
          : formData.password,
        Score: parseInt(formData.score) || 0,
        Role: formData.role,
        ...(editingId && { Id: editingId }) 
      },
      {
        login: formData.login,
        password: editingId && (!formData.password || formData.password.trim() === '') 
          ? undefined 
          : formData.password,
        score: parseInt(formData.score) || 0,
        role: formData.role,
        ...(editingId && { id: editingId })
      }
    ];

    const url = editingId 
      ? `${API_URL}/api/users/${editingId}`
      : `${API_URL}/api/users`;
    
    const method = editingId ? 'PUT' : 'POST';

    console.log(`Tentative de ${method} vers ${url} pour ID: ${editingId}`);

    let response;
    let lastError;

    for (let attempt = 0; attempt < userDataAttempts.length; attempt++) {
      const userData = userDataAttempts[attempt];
      console.log(`Tentative ${attempt + 1} avec données:`, userData);

      const cleanUserData = Object.fromEntries(
        Object.entries(userData).filter(([_, v]) => v !== undefined)
      );

      try {
        response = await fetch(url, {
          method: method,
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(cleanUserData),
        });

        console.log(`Tentative ${attempt + 1} - Status:`, response.status);

        if (response.ok) {
          const result = await response.json();
          console.log("Réponse API:", result);
          
          fetchUsers();
          handleCloseModal();
          
          return;
        }

        if (response.status === 400) {
          const errorText = await response.text();
          console.log(`Tentative ${attempt + 1} - Erreur:`, errorText);
          
          if (errorText.includes("ID incompatible")) {
            console.log("Essai PUT sans ID dans l'URL...");
            const putWithoutIdResponse = await fetch(`${API_URL}/api/users`, {
              method: 'PUT',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                ...cleanUserData,
                Id: editingId 
              }),
            });
            
            if (putWithoutIdResponse.ok) {
              const result = await putWithoutIdResponse.json();
              console.log(" Modification réussie via PUT sans ID URL:", result);
              fetchUsers();
              handleCloseModal();
              return;
            }
          }
          
          lastError = errorText;
        }

      } catch (attemptError) {
        console.log(`Tentative ${attempt + 1} - Erreur:`, attemptError);
        lastError = attemptError.message;
      }
    }

    throw new Error(`Échec de ${editingId ? 'modification' : 'ajout'} : ${lastError}`);

  } catch (error) {
    console.error(' Erreur complète:', error);
    
    let userMessage = error.message;
    
    if (error.message.includes("ID incompatible")) {
      userMessage = "Erreur: Problème de correspondance d'ID. Vérifiez le format des données.";
    } else if (error.message.includes("Failed to fetch")) {
      userMessage = "Erreur de connexion au serveur. Vérifiez que le serveur .NET est démarré.";
    } else if (error.message.includes("400")) {
      userMessage = "Requête incorrecte. Vérifiez les données saisies.";
    }
    
  }
};
useEffect(() => {
  const fetchUsers = async () => {
  const response = await fetch(`${API_URL}/api/users/with-points`);

  const data = await response.json();
const formatted = data.map(u => ({
  id: u.id,
  login: u.login,
  role: u.role,
  score: u.points 
}));

setUsers(formatted);
};

  fetchUsers();
}, []);

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
      console.log("Suppression réussie (204)");
      await fetchUsers();
      return;
    }

    let errorMessage = `Erreur ${response.status}`;
    
    try {
      const errorData = await response.json();
      console.error("Erreur API (JSON):", errorData);
      errorMessage = errorData.message || errorData.error || errorMessage;
      
      if (errorData.details) {
        errorMessage += `\nDétails: ${errorData.details}`;
      }
    } catch (jsonError) {
      const errorText = await response.text();
      console.error("Erreur API (texte):", errorText);
      errorMessage = errorText || errorMessage;
    }


  } catch (error) {
    console.error('Erreur réseau:', error);
  }
};
  const handleEditUser = (id) => {
    const userToEdit = users.find(user => user.id === id);
    if (userToEdit) {
      setFormData({
        login: userToEdit.login || userToEdit.nom, 
        password: "", 
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
            <div className="image-text-content">
              <h1 className="image-title">Challenge Pronostics <p></p> Coupe du Monde 2026- Neosys</h1><p></p>
              <p>   </p>
              <p className="image-subtitle">
                A l'occasion du Coupe du monde des Nations, nous lançons un jeu de pronostics interne
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
                   {users
                    .filter(user => user.role !== "admin") 
                    .map((user) => (
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