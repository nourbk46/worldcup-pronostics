import React, { useState, useEffect } from "react";
import Sidebar from "./Sidebar";
import backg from "../Assets/photoF.jpeg";
import "./matches.css";

const getMatchStatus = (matchDate, score1, score2) => {
  const now = new Date();
  const matchTime = new Date(matchDate);

  if (score1 != null && score2 != null) return "terminé"; 
  if (now >= matchTime) return "en cours";          
  return "à venir";                                  
};

const Matches = () => {
  const [matches, setMatches] = useState([]);
  const [teams, setTeams] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    team1Id: "",
    team2Id: "",
    date: "",
    score1: "",
    score2: "",
      pronosticCloseMinutes: 120 // valeur par défaut

  });
  const [editingId, setEditingId] = useState(null);

  const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

  useEffect(() => {
    fetchMatches();
    fetchTeams();
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      setMatches(prev =>
        prev.map(match => ({
          ...match,
          status: getMatchStatus(match.date, match.score1, match.score2)
        }))
      );
    }, 60000);

    return () => clearInterval(interval);
  }, []);
  const fetchMatches = async () => {

    setLoading(true);
    try {
      const response = await fetch(`${API_URL}/api/matches`);
      if (response.ok) {
        let data = await response.json();
        data = data.map(match => ({
          ...match,
          status: getMatchStatus(match.date, match.score1, match.score2),
          pronosticCloseMinutes: match.pronosticCloseMinutes ?? 120 // valeur par défaut si API ne renvoie rien
        }));
        setMatches(data);
      }
    } catch (error) {
      console.error("Erreur chargement matches:", error);
      setMatches([
        { id: 1, match: "Mexique vs Afrique du Sud", date: "2026-06-12T21:00", score: "0 - 0", status: "à venir" },
      ]);
    } finally {
      setLoading(false);
    }
  };

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
  const isPronosticAllowed = (matchDate, pronosticCloseMinutes) => {
  if (!matchDate) return false;
  const now = new Date();
  const matchTime = new Date(matchDate);
  const diffMinutes = (matchTime - now) / 1000 / 60; // différence en minutes
  return diffMinutes >= pronosticCloseMinutes;
};


  const handleOpenModal = () => {
    setEditingId(null);
    setFormData({
      team1Id: "",
      team2Id: "",
      date: "",
      score1: "",
      score2: "",
        pronosticCloseMinutes: 120 // par défaut

    });
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingId(null);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    setFormData(prev => ({
    ...prev,
    [name]: name === "score1" || name === "score2" || name === "pronosticCloseMinutes"
      ? parseInt(value) || 0  // convertit en nombre
      : value
  }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.team1Id || !formData.team2Id || !formData.date) {
      return;
    }
    if (formData.team1Id === formData.team2Id) {
      return;
    }

    try {
      const matchData = {
        team1Id: parseInt(formData.team1Id),
        team2Id: parseInt(formData.team2Id),
        matchDate: formData.date,
        score1: formData.score1 ? parseInt(formData.score1) : null,
        score2: formData.score2 ? parseInt(formData.score2) : null,
          pronosticCloseMinutes: parseInt(formData.pronosticCloseMinutes) || 120

      };

      const url = editingId ? `${API_URL}/api/matches/${editingId}` : `${API_URL}/api/matches`;
      const method = editingId ? "PUT" : "POST";

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(matchData)
      });

      if (response.ok) {
        const result = await response.json();
        fetchMatches();
        handleCloseModal();
      } else {
        const error = await response.json();
      }
    } catch (error) {
      console.error("Erreur:", error);
    }
  };

  const handleEditMatch = (id) => {
    const matchToEdit = matches.find(m => m.id === id);
    if (matchToEdit) {
      const team1 = teams.find(t => t.name === matchToEdit.team1Name);
      const team2 = teams.find(t => t.name === matchToEdit.team2Name);

      setFormData({
        team1Id: team1?.id || "",
        team2Id: team2?.id || "",
        date: matchToEdit.date || "",
        score1: matchToEdit.score1 || "",
        score2: matchToEdit.score2 || "",
          pronosticCloseMinutes: matchToEdit.pronosticCloseMinutes || 120

      });
      setEditingId(id);
      setShowModal(true);
    }
  };

  const handleDeleteMatch = async (id) => {
    if (!window.confirm("Êtes-vous sûr de vouloir supprimer ce match ?")) return;

    try {
      const response = await fetch(`${API_URL}/api/matches/${id}`, { method: "DELETE" });
      if (response.ok) {
        fetchMatches();
      } else {
        const error = await response.json();
      }
    } catch (error) {
      console.error("Erreur:", error);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return "";
    const [datePart, timePart] = dateString.split("T");
    const [year, month, day] = datePart.split("-");
    const [hours, minutes] = timePart.split(":");
    return `${day}-${month}-${year} ${hours}:${minutes}`;
  };

  return (
    <div className="matches-layout">
      <Sidebar />
      <div className="matches-main">
        <div className="matches-content">
          <div className="matches-back-image">
            <img src={backg} alt="background" />
            <div className="matches-image-text-content">
              <h1 className="matches-image-title">Challenge Pronostics <p></p> Coupe du Monde 2026- Neosys</h1>
              <p className="matches-image-subtitle">
                A l'occasion du Coupe du monde des Nations, nous lançons un jeu de pronostics interne
                pour allier passion du football et esprit d'équipe.<br/>
                <strong>Qui sera le meilleur analyste sportif de l'entreprise ?</strong>
              </p>
            </div>
          </div>

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
                      <th>fermuture</th>
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
                            {match.score ?? "0 - 0"}
                          </span>
                        </td>
                        <td>
                          <span className={`matches-status-badge ${
                            match.status === 'terminé' ? 'matches-status-completed' :
                            match.status === 'en cours' ? 'matches-status-ongoing' :
                            'matches-status-upcoming'}`}>
                            {match.status}
                          </span>
                        </td>
                        <td>{match.pronosticCloseMinutes} min avant le match</td>
                        <td className="matches-actions-cell">
                          <button className="matches-btn-modify-icon" title="Modifier" onClick={() => handleEditMatch(match.id)}>✏️</button>
                          <button className="matches-btn-delete-icon" title="Supprimer" onClick={() => handleDeleteMatch(match.id)}>🗑️</button>
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

      {showModal && (
        <div className="matches-modal-overlay" onClick={handleCloseModal}>
          <div className="matches-modal-content" onClick={e => e.stopPropagation()}>
            <div className="matches-modal-header">
              <h2 className="matches-modal-title">{editingId ? "Modifier le match" : "Ajouter un nouveau match"}</h2>
              <button className="matches-modal-close" onClick={handleCloseModal}>&times;</button>
            </div>

            <form className="matches-modal-form" onSubmit={handleSubmit}>
              <div className="matches-form-group">
                <label>Équipe 1 *</label>
                <select name="team1Id" value={formData.team1Id} onChange={handleInputChange} required>
                  <option value="">Sélectionnez une équipe</option>
                  {teams.map(team => <option key={team.id} value={team.id}>{team.name}</option>)}
                </select>
              </div>

              <div className="matches-form-group">
                <label>Équipe 2 *</label>
                <select name="team2Id" value={formData.team2Id} onChange={handleInputChange} required>
                  <option value="">Sélectionnez une équipe</option>
                  {teams.map(team => <option key={team.id} value={team.id}>{team.name}</option>)}
                </select>
              </div>

              <div className="matches-form-group">
                <label>Date & Heure *</label>
                <input type="datetime-local" name="date" value={formData.date} onChange={handleInputChange} required/>
              </div>

              <div className="matches-form-group">
                <label>Score Équipe 1 </label>
                <input type="number" name="score1" value={formData.score1} onChange={handleInputChange} min="0" placeholder="0"/>
              </div>

              <div className="matches-form-group">
                <label>Score Équipe 2 </label>
                <input type="number" name="score2" value={formData.score2} onChange={handleInputChange} min="0" placeholder="0"/>
              </div>
              <div className="matches-form-group">
              <label>Temps fermeture pronostic (minutes) *</label>
              <input
                type="number"
                name="pronosticCloseMinutes"
                value={formData.pronosticCloseMinutes || ""}
                onChange={handleInputChange}
                min="1"
                placeholder="120"
                required
                
              />
            </div>



              <div className="matches-form-actions">
                <button type="button" className="matches-btn-cancel" onClick={handleCloseModal}>Annuler</button>
                <button type="submit" className="matches-btn-submit">{editingId ? "Modifier" : "Ajouter"} le match</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Matches;
