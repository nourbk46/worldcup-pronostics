import React, { useState, useEffect } from "react";
import Sidebar from "./Sidebar";
import backg from "../Assets/backg.png";
import logo from "../Assets/logo.png";
import "./matches.css";

const Matches = () => {
  const [matches, setMatches] = useState([]);
  const [teams, setTeams] = useState([]); // Pour la liste des équipes
  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    team1Id: "",
    team2Id: "",
    date: "",
    score1: "",
    score2: ""
  });
  const [editingId, setEditingId] = useState(null);

  // URL de l'API
const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';
  // Charger les matches et équipes
  useEffect(() => {
    fetchMatches();
    fetchTeams();
  }, []);

  // Fonction pour récupérer les matches
  const fetchMatches = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${API_URL}/api/matches`);
      if (response.ok) {
        const data = await response.json();
        setMatches(data);
      }
    } catch (error) {
      console.error("Erreur chargement matches:", error);
      // Fallback: données locales
      setMatches([
        { id: 1, match: "Mexique vs Afrique du Sud", date: "2026-06-12T21:00", score: "0 - 0", status: "à venir" },
        // ... autres matches
      ]);
    } finally {
      setLoading(false);
    }
  };

  // Fonction pour récupérer les équipes
  const fetchTeams = async () => {
    try {
      const response = await fetch(`${API_URL}/api/teams`);
      if (response.ok) {
        const data = await response.json();
        setTeams(data);
      }
    } catch (error) {
      console.error("Erreur chargement équipes:", error);
    }
  };

  // Modal functions
  const handleOpenModal = () => {
    setEditingId(null);
    setFormData({
      team1Id: "",
      team2Id: "",
      date: "",
      score1: "",
      score2: ""
    });
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingId(null);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };

  // Ajouter/modifier un match
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validation
    if (!formData.team1Id || !formData.team2Id || !formData.date) {
      alert("Veuillez remplir tous les champs requis");
      return;
    }

    if (formData.team1Id === formData.team2Id) {
      alert("Les deux équipes doivent être différentes");
      return;
    }

    try {
      const matchData = {
        team1Id: parseInt(formData.team1Id),
        team2Id: parseInt(formData.team2Id),
        matchDate: formData.date,
        score1: formData.score1 ? parseInt(formData.score1) : null,
        score2: formData.score2 ? parseInt(formData.score2) : null
      };

      const url = editingId 
        ? `${API_URL}/api/matches/${editingId}`
        : `${API_URL}/api/matches`;
      
      const method = editingId ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method: method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(matchData),
      });

      if (response.ok) {
        const result = await response.json();
        alert(editingId ? "Match modifié !" : "Match ajouté !");
        fetchMatches();
        handleCloseModal();
      } else {
        const error = await response.json();
        alert(`Erreur: ${error.message}`);
      }
    } catch (error) {
      console.error("Erreur:", error);
      alert("Erreur de connexion");
    }
  };

  // Modifier un match
  const handleEditMatch = (id) => {
    const matchToEdit = matches.find(match => match.id === id);
    if (matchToEdit) {
      // Trouver les IDs des équipes par leur nom
      const team1 = teams.find(t => t.name === matchToEdit.team1Name);
      const team2 = teams.find(t => t.name === matchToEdit.team2Name);
      
      setFormData({
        team1Id: team1?.id || "",
        team2Id: team2?.id || "",
        date: matchToEdit.date || "",
        score1: matchToEdit.score1 || "",
        score2: matchToEdit.score2 || ""
      });
      setEditingId(id);
      setShowModal(true);
    }
  };

  // Supprimer un match
  const handleDeleteMatch = async (id) => {
    if (!window.confirm("Êtes-vous sûr de vouloir supprimer ce match ?")) {
      return;
    }

    try {
      const response = await fetch(`${API_URL}/api/matches/${id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        alert("Match supprimé !");
        fetchMatches();
      } else {
        const error = await response.json();
        alert(`Erreur: ${error.message}`);
      }
    } catch (error) {
      console.error("Erreur:", error);
      alert("Erreur de connexion");
    }
  };

  // Mettre à jour le score
  const handleUpdateScore = async (id) => {
    const newScore = prompt("Entrez le nouveau score (format: X - Y):");
    if (!newScore) return;

    const [score1, score2] = newScore.split("-").map(s => parseInt(s.trim()));
    
    if (isNaN(score1) || isNaN(score2)) {
      alert("Format invalide. Utilisez: X - Y");
      return;
    }

    try {
      const response = await fetch(`${API_URL}/api/matches/${id}/score`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ score1, score2 }),
      });

      if (response.ok) {
        const result = await response.json();
        alert("Score mis à jour !");
        fetchMatches();
      } else {
        const error = await response.json();
        alert(`Erreur: ${error.message}`);
      }
    } catch (error) {
      console.error("Erreur:", error);
      alert("Erreur de connexion");
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return "";
    
    if (dateString.includes("T")) {
      const [datePart, timePart] = dateString.split("T");
      const [year, month, day] = datePart.split("-");
      const [hours, minutes] = timePart.split(":");
      return `${day}-${month}-${year} ${hours}:${minutes}`;
    }
    
    return dateString;
  };

  return (
    <div className="matches-layout">
      <Sidebar />
      <div className="matches-main">
        <div className="matches-content">
          {/* Header avec image */}
          <div className="matches-back-image">
            <img src={backg} alt="background" />
            <div className="matches-logo-overlay">
              <img src={logo} alt="Neosys Logo" className="matches-logo-right" />
            </div>
            <div className="matches-image-text-content">
              <h1 className="matches-image-title">Challenge Pronostics AFCON - Neosys</h1>
              <p className="matches-image-subtitle">
                A l'occasion du Coupe du monde des Nations, nous lançons un jeu de pronostics interne
                pour allier passion du football et esprit d'équipe.<br />
                <strong>Qui sera le meilleur analyste sportif de l'entreprise ?</strong>
              </p>
            </div>
          </div>
          
          {/* Contenu principal */}
          <div className="matches-content-wrapper">
            <div className="matches-section-header">
              <h3 className="matches-section-title">Gestion des Matchs</h3>
              <button className="matches-btn-add" onClick={handleOpenModal}>
                <span className="matches-btn-icon">➕</span>
                Ajouter un match
              </button>
            </div>
            
            {loading ? (
              <div className="loading">Chargement...</div>
            ) : (
              <div className="matches-white-table-container">
                <table className="matches-table">
                  <thead>
                    <tr>
                      <th>Match</th>
                      <th>Date & Heure</th>
                      <th>Score Final</th>
                      <th>Statut</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {matches.map((match) => (
                      <tr key={match.id}>
                        <td>{match.match}</td>
                        <td>{formatDate(match.date)}</td>
                        <td>
                          <span className={`matches-score-badge ${match.status === 'terminé' ? 'matches-score-final' : 'matches-score-pending'}`}>
                            {match.score}
                          </span>
                        </td>
                        <td>
                          <span className={`matches-status-badge ${match.status === 'terminé' ? 'matches-status-completed' : 'matches-status-upcoming'}`}>
                            {match.status}
                          </span>
                        </td>
                        <td className="matches-actions-cell">
                          
                          <button 
                            className="matches-btn-modify-icon" 
                            title="Modifier"
                            onClick={() => handleEditMatch(match.id)}
                          >
                            ✏️
                          </button>
                          <button 
                            className="matches-btn-delete-icon" 
                            title="Supprimer"
                            onClick={() => handleDeleteMatch(match.id)}
                          >
                            🗑️
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="matches-modal-overlay" onClick={handleCloseModal}>
          <div className="matches-modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="matches-modal-header">
              <h2 className="matches-modal-title">
                {editingId ? "Modifier le match" : "Ajouter un nouveau match"}
              </h2>
              <button className="matches-modal-close" onClick={handleCloseModal}>
                &times;
              </button>
            </div>
            
            <form className="matches-modal-form" onSubmit={handleSubmit}>
              <div className="matches-form-group">
                <label>Équipe 1 *</label>
                <select
                  name="team1Id"
                  value={formData.team1Id}
                  onChange={handleInputChange}
                  required
                >
                  <option value="">Sélectionnez une équipe</option>
                  {teams.map(team => (
                    <option key={team.id} value={team.id}>{team.name}</option>
                  ))}
                </select>
              </div>

              <div className="matches-form-group">
                <label>Équipe 2 *</label>
                <select
                  name="team2Id"
                  value={formData.team2Id}
                  onChange={handleInputChange}
                  required
                >
                  <option value="">Sélectionnez une équipe</option>
                  {teams.map(team => (
                    <option key={team.id} value={team.id}>{team.name}</option>
                  ))}
                </select>
              </div>

              <div className="matches-form-group">
                <label htmlFor="date">Date & Heure *</label>
                <input
                  type="datetime-local"
                  id="date"
                  name="date"
                  value={formData.date}
                  onChange={handleInputChange}
                  required
                />
              </div>

              <div className="matches-form-group">
                <label>Score Équipe 1 (optionnel)</label>
                <input
                  type="number"
                  name="score1"
                  value={formData.score1}
                  onChange={handleInputChange}
                  min="0"
                  placeholder="0"
                />
              </div>

              <div className="matches-form-group">
                <label>Score Équipe 2 (optionnel)</label>
                <input
                  type="number"
                  name="score2"
                  value={formData.score2}
                  onChange={handleInputChange}
                  min="0"
                  placeholder="0"
                />
              </div>
              
              <div className="matches-form-actions">
                <button type="button" className="matches-btn-cancel" onClick={handleCloseModal}>
                  Annuler
                </button>
                <button type="submit" className="matches-btn-submit">
                  {editingId ? "Modifier" : "Ajouter"} le match
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Matches;