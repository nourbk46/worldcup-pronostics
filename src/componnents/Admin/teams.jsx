import React, { useState, useEffect } from "react";
import "./Sidebar.css";
import Sidebar from "./Sidebar";
import backg from "../Assets/photoF.jpeg";
import "./teams.css";

import afDuS from "../Assets/flags/AfDuS.png";
import bosnie from "../Assets/flags/bosnie.svg";
import bresil from "../Assets/flags/bresil.jfif";
import canada from "../Assets/flags/canada.png";
import etatUnis from "../Assets/flags/etat.jfif";
import maroc from "../Assets/flags/maroc.png";
import macedoine from "../Assets/flags/mecadonie.png";
import mexique from "../Assets/flags/mexique.png";
import espagne from "../Assets/flags/espagne.png";
import tunisie from "../Assets/flags/tunisie.png";
import uruguay from "../Assets/flags/uruguay.jpg";
import turquie from "../Assets/flags/turc.jpg";
import ukraine from "../Assets/flags/ukraine.png";
import suisse from "../Assets/flags/suisse.jpg";
import senegal from "../Assets/flags/senegal.png";
import repCoree from "../Assets/flags/repDuCore.webp";
import qatar from "../Assets/flags/qatar.jfif";
import paraguay from "../Assets/flags/paraguay.jpg";
import nvZelande from "../Assets/flags/nouvZelande.png";
import norvege from "../Assets/flags/norvege.png";
import jordanie from "../Assets/flags/jordanie.png";
import japon from "../Assets/flags/japon.png";
import iran from "../Assets/flags/iran.jpg";
import haiti from "../Assets/flags/haiti.jpg";
import france from "../Assets/flags/france.jpg";
import equateur from "../Assets/flags/equateur.png";
import ecosse from "../Assets/flags/ecosse.png";
import curacao from "../Assets/flags/curacao.png";
import croatie from "../Assets/flags/croatie.png";
import cote from "../Assets/flags/cote.png";
import capVert from "../Assets/flags/capVert.png";
import belgique from "../Assets/flags/belgique.jpg";
import australie from "../Assets/flags/australie.jpg";
import arabie from "../Assets/flags/arabie Saoudite.png";
import allemagne from "../Assets/flags/allemagne.jpg";
import algerie from "../Assets/flags/algerie.jfif";

const API_URL = "http://localhost:5000/api";

const normalize = (str) =>
  str
    ? str
        .toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .trim()
    : "";

const FLAG_MAPPING = {
  [normalize("Afrique du Sud")]: afDuS,
  [normalize("Bosnie")]: bosnie,
  [normalize("Brésil")]: bresil,
  [normalize("Canada")]: canada,
  [normalize("États-Unis")]: etatUnis,
  [normalize("Maroc")]: maroc,
  [normalize("Macédoine")]: macedoine,
  [normalize("Mexique")]: mexique,
  [normalize("Espagne")]: espagne,
  [normalize("Tunisie")]: tunisie,
  [normalize("Uruguay")]: uruguay,
  [normalize("Turquie")]: turquie,
  [normalize("Ukraine")]: ukraine,
  [normalize("Suisse")]: suisse,
  [normalize("Sénégal")]: senegal,
  [normalize("République de Corée")]: repCoree,
  [normalize("Qatar")]: qatar,
  [normalize("Paraguay")]: paraguay,
  [normalize("Nouvelle-Zélande")]: nvZelande,
  [normalize("Norvège")]: norvege,
  [normalize("Jordanie")]: jordanie,
  [normalize("Japon")]: japon,
  [normalize("Iran")]: iran,
  [normalize("Haïti")]: haiti,
  [normalize("France")]: france,
  [normalize("Équateur")]: equateur,
  [normalize("Écosse")]: ecosse,
  [normalize("Curaçao")]: curacao,
  [normalize("Croatie")]: croatie,
  [normalize("Côte d'Ivoire")]: cote,
  [normalize("Cap-Vert")]: capVert,
  [normalize("Belgique")]: belgique,
  [normalize("Australie")]: australie,
  [normalize("Arabie Saoudite")]: arabie,
  [normalize("Allemagne")]: allemagne,
  [normalize("Algérie")]: algerie,
};

const Teams = () => {
  const [teams, setTeams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [apiError, setApiError] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [newTeam, setNewTeam] = useState({
    name: "",
    flag: null,
    flagPreview: null
  });
  const [formError, setFormError] = useState("");
  const [isEditing, setIsEditing] = useState(false);
  const [editingTeamId, setEditingTeamId] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Stockage des drapeaux personnalisés
  const [customFlags, setCustomFlags] = useState(() => {
    try {
      const saved = localStorage.getItem('customFlags');
      return saved ? JSON.parse(saved) : {};
    } catch {
      return {};
    }
  });

  // Fonction pour sauvegarder un drapeau personnalisé
  const saveCustomFlag = (teamId, flagUrl) => {
    const updated = { ...customFlags, [teamId]: flagUrl };
    setCustomFlags(updated);
    try {
      localStorage.setItem('customFlags', JSON.stringify(updated));
    } catch (error) {
      console.error("Erreur sauvegarde localStorage:", error);
    }
  };

  // Fonction pour obtenir le drapeau d'une équipe
  const getFlagForTeam = React.useCallback((teamName, teamId = null) => {
    // 1. Priorité: drapeau personnalisé sauvegardé
    if (teamId && customFlags[teamId]) {
      return customFlags[teamId];
    }
    
    // 2. Recherche dans le mapping
    if (teamName) {
      const normalized = normalize(teamName);
      return FLAG_MAPPING[normalized] || null;
    }
    
    return null;
  }, [customFlags]);

  useEffect(() => {
    fetchTeams();
  }, []);

  const fetchTeams = async () => {
    console.log("🔵 fetchTeams démarré");
    
    try {
      setLoading(true);
      const response = await fetch(`${API_URL}/teams`);
      
      if (!response.ok) {
        throw new Error(`Erreur ${response.status}`);
      }
      
      const text = await response.text();
      console.log("📥 Réponse API brute:", text);
      
      if (!text || text.trim() === "") {
        console.warn("⚠️ Réponse vide de l'API");
        setTeams([]);
        return;
      }
      
      const data = JSON.parse(text);
      console.log("📊 Données parsées:", data);
      
      // Transformer les données
      const teamsWithFlags = data.map(team => {
        // Vérifier la structure de l'équipe
        const teamId = team.Id || team.id;
        const teamName = team.Name || team.name;
        const flagPath = team.FlagPath || team.flagPath;
        
        console.log(`🔍 Traitement équipe: ID=${teamId}, Nom="${teamName}", FlagPath="${flagPath}"`);
        
        // Construire l'URL du drapeau
        let flagUrl = null;
        
        if (flagPath && flagPath.trim() !== "") {
          // Drapeau depuis l'API
          flagUrl = `http://localhost:5000/flags/${flagPath}`;
          console.log(`   📍 Drapeau API: ${flagUrl}`);
        } else {
          // Drapeau depuis mapping ou personnalisé
          flagUrl = getFlagForTeam(teamName, teamId);
          console.log(`   📍 Drapeau mapping/personnalisé: ${flagUrl ? "Trouvé" : "Non trouvé"}`);
        }
        
        // Fallback sur France
        if (!flagUrl) {
          flagUrl = france;
          console.log(`   📍 Fallback sur drapeau France`);
        }
        
        return {
          id: teamId,
          name: teamName,
          flag: flagUrl,
          flagPath: flagPath
        };
      });
      
      console.log("✅ Équipes finales:", teamsWithFlags);
      setTeams(teamsWithFlags);
      setApiError("");
      
    } catch (err) {
      console.error("❌ Erreur fetchTeams:", err);
      setApiError("Impossible de charger depuis l'API. Utilisation des données locales.");
      
      // Fallback local
      const localTeams = Object.entries(FLAG_MAPPING)
        .filter(([key]) => key !== "default")
        .map(([name, flag], index) => ({
          id: index + 1,
          name: Object.keys(FLAG_MAPPING).find(key => normalize(key) === name) || name,
          flag: flag,
          flagPath: null
        }));
      
      console.log("🔄 Utilisation données locales:", localTeams);
      setTeams(localTeams);
    } finally {
      setLoading(false);
      console.log("🔵 fetchTeams terminé");
    }
  };

  const handleOpenModal = () => {
    setIsEditing(false);
    setEditingTeamId(null);
    setNewTeam({
      name: "",
      flag: null,
      flagPreview: null
    });
    setShowModal(true);
    setFormError("");
  };
  
  const handleCloseModal = () => {
    setShowModal(false);
    setNewTeam({
      name: "",
      flag: null,
      flagPreview: null
    });
    setFormError("");
    setIsEditing(false);
    setEditingTeamId(null);
  };

  const handleNameChange = (e) => {
    setNewTeam({
      ...newTeam,
      name: e.target.value
    });
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (file.size > 2 * 1024 * 1024) {
      setFormError("Le fichier est trop volumineux (max 2MB)");
      return;
    }

    const validTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/svg+xml'];
    if (!validTypes.includes(file.type)) {
      setFormError("Type de fichier non supporté. Utilisez JPG, PNG, GIF ou SVG.");
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      setNewTeam({
        ...newTeam,
        flag: file,
        flagPreview: reader.result
      });
      setFormError(""); 
    };
    reader.readAsDataURL(file);
  };

  const handleSubmitTeam = async (e) => {
  e.preventDefault();
  console.log("🟢 handleSubmitTeam démarré, isEditing:", isEditing);

  if (!newTeam.name.trim()) {
    setFormError("Le nom de l'équipe est requis");
    return;
  }

  setIsSubmitting(true);

  try {
    const teamData = { name: newTeam.name.trim() };
    let url = API_URL + "/teams";
    let method = "POST";
    let teamId = editingTeamId;

    if (isEditing) {
      url = `${API_URL}/teams/${editingTeamId}`;
      method = "PUT";
    }

    console.log(`📤 ${method} vers ${url}`, teamData);

    // 1. Envoyer les données de l'équipe (nom)
    const response = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(teamData)
    });

    const responseText = await response.text();
    console.log("📥 Réponse brute:", responseText);
    
    let data = {};
    if (responseText) {
      try {
        data = JSON.parse(responseText);
        console.log("📊 Données parsées:", data);
      } catch (e) {
        console.error("❌ Erreur parsing JSON:", e);
        data = { message: responseText };
      }
    }

    if (!response.ok) {
      throw new Error(data.message || data.error || `Erreur ${response.status}: ${response.statusText}`);
    }

    const actualTeamId = data.Id || data.id || editingTeamId;
    console.log("🆔 ID équipe:", actualTeamId);

    let finalFlagUrl = newTeam.flagPreview;
    
    // 2. Si un drapeau a été sélectionné
    if (newTeam.flag && newTeam.flag instanceof File) {
      console.log("🖼️ Upload du drapeau...");
      try {
        // Upload vers l'endpoint /flag
        const uploadResult = await uploadFlag(actualTeamId, newTeam.flag);
        console.log("✅ Drapeau uploadé avec succès:", uploadResult);
        
        // Récupérer l'URL du drapeau uploadé
        if (uploadResult.flagUrl) {
          finalFlagUrl = uploadResult.flagUrl;
        } else if (uploadResult.flagPath) {
          finalFlagUrl = `http://localhost:5000/flags/${uploadResult.flagPath}`;
        }
        
        // Sauvegarder aussi localement pour backup
        if (newTeam.flagPreview) {
          saveCustomFlag(actualTeamId, newTeam.flagPreview);
        }
      } catch (uploadError) {
        console.warn("⚠️ Erreur upload drapeau:", uploadError);
        // Sauvegarder localement en backup
        if (newTeam.flagPreview) {
          saveCustomFlag(actualTeamId, newTeam.flagPreview);
          finalFlagUrl = newTeam.flagPreview;
        }
      }
    } else if (newTeam.flagPreview && !newTeam.flag) {
      // C'est une URL (base64) existante, sauvegarder localement
      console.log("💾 Sauvegarde locale du drapeau (base64)");
      saveCustomFlag(actualTeamId, newTeam.flagPreview);
      finalFlagUrl = newTeam.flagPreview;
    }

    // 3. Mettre à jour IMMÉDIATEMENT le state local
    console.log("🔄 Mise à jour immédiate du state...");
    
    if (isEditing) {
      // Pour une modification
      setTeams(prevTeams => {
        const updatedTeams = prevTeams.map(team => {
          if (team.id === actualTeamId) {
            const updatedTeam = {
              ...team,
              name: newTeam.name.trim(),
              flag: finalFlagUrl || team.flag, // Utiliser le nouveau drapeau ou garder l'ancien
              flagPath: data.FlagPath || team.flagPath
            };
            console.log("✅ Équipe mise à jour localement:", updatedTeam);
            return updatedTeam;
          }
          return team;
        });
        console.log("📋 Toutes les équipes après update:", updatedTeams);
        return updatedTeams;
      });
    } else {
      // Pour une nouvelle équipe
      const newTeamObj = {
        id: actualTeamId,
        name: newTeam.name.trim(),
        flag: finalFlagUrl || getFlagForTeam(newTeam.name.trim()) || france,
        flagPath: data.FlagPath || null
      };
      console.log("✅ Nouvelle équipe ajoutée localement:", newTeamObj);
      setTeams(prevTeams => [...prevTeams, newTeamObj]);
    }

  
    
    handleCloseModal();
    
  } catch (err) {
    console.error("❌ Erreur dans handleSubmitTeam:", err);
    setFormError(err.message || "Une erreur est survenue");
  } finally {
    setIsSubmitting(false);
    console.log("🟢 handleSubmitTeam terminé");
  }
};
  const uploadFlag = async (teamId, flagFile) => {
    console.log(`📤 Upload drapeau pour équipe ${teamId}`);
    
    const formData = new FormData();
    formData.append("flag", flagFile);

    const response = await fetch(`${API_URL}/teams/${teamId}/flag`, {
      method: "POST",
      body: formData
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("❌ Erreur upload:", errorText);
      throw new Error(errorText || "Erreur lors de l'upload du drapeau");
    }

    const result = await response.json();
    console.log("✅ Upload réussi:", result);
    return result;
  };

  const handleEdit = (team) => {
    console.log("✏️ Modification équipe:", team);
    
    setIsEditing(true);
    setEditingTeamId(team.id);
    setNewTeam({
      name: team.name,
      flag: null, // Réinitialiser le fichier
      flagPreview: team.flag || null // Garder l'aperçu existant
    });
    setFormError("");
    setShowModal(true);
  };

  const handleDelete = async (teamId) => {
    const team = teams.find(t => t.id === teamId);
    
    if (!window.confirm(`Supprimer l'équipe "${team?.name}" ?`)) {
      return;
    }

    try {
      console.log(`🗑️ Suppression équipe ${teamId}...`);
      
      const response = await fetch(`${API_URL}/teams/${teamId}`, {
        method: "DELETE",
        headers: { 'Accept': 'application/json' }
      });

      console.log("📥 Statut:", response.status);
      
      const responseText = await response.text();
      console.log("📥 Réponse:", responseText);
      
      let responseData = {};
      if (responseText) {
        try {
          responseData = JSON.parse(responseText);
        } catch (parseError) {
          console.warn("⚠️ Réponse non-JSON:", responseText);
        }
      }

      if (response.ok) {
        // Supprimer de l'état local
        setTeams(teams.filter(t => t.id !== teamId));
        
        // Supprimer le drapeau personnalisé
        if (customFlags[teamId]) {
          const newCustomFlags = { ...customFlags };
          delete newCustomFlags[teamId];
          setCustomFlags(newCustomFlags);
          localStorage.setItem('customFlags', JSON.stringify(newCustomFlags));
        }
        
        console.log("✅ Suppression réussie!");
      } else {
        const errorMsg = responseData.message || 
                        responseData.error || 
                        `Erreur ${response.status}: ${response.statusText}`;
        throw new Error(errorMsg);
      }
      
    } catch (err) {
      console.error("❌ Erreur détaillée:", err);
    }
  };

  return (
    <div className="team-layout">
      <Sidebar />
      <div className="team-main">
        <div className="team-content">
          <div className="team-back-image">
            <img src={backg} alt="background" />
            <div className="team-image-text-content">
              <h1 className="team-image-title">Challenge Pronostics <p></p> Coupe du Monde 2026- Neosys</h1>
              <p className="team-image-subtitle">
                A l'occasion du Coupe du monde des Nations, nous lançons un jeu de pronostics interne
                pour allier passion du football et esprit d'équipe.<br></br>
                <strong>Qui sera le meilleur analyste sportif de l'entreprise ?</strong>
              </p>
            </div>
          </div>

          <div className="team-content-wrapper">
            <div className="team-section-header">
              <h3 className="team-section-title">Gestion des équipes</h3>
              <button className="team-btn-add" onClick={handleOpenModal}>
                <span className="team-btn-icon">➕</span>
                Ajouter une équipe
              </button>
            </div>

            {apiError && (
              <div className="alert alert-warning">
                {apiError}
              </div>
            )}

            <div className="team-white-table-container">
              <table className="team-table">
                <thead>
                  <tr>
                    <th>Drapeau</th>
                    <th>Équipe</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    <tr>
                      <td colSpan="3" className="text-center">
                        <div className="loading-spinner">Chargement...</div>
                      </td>
                    </tr>
                  ) : teams.length === 0 ? (
                    <tr>
                      <td colSpan="3" className="text-center">
                        <p className="no-data">Aucune équipe trouvée. Ajoutez votre première équipe !</p>
                      </td>
                    </tr>
                  ) : (
                    teams.map((team) => (
                      <tr key={team.id}>
                        <td>
                          <img 
                            src={team.flag} 
                            alt={`Drapeau ${team.name}`} 
                            className="team-flag"
                            onError={(e) => {
                              console.warn(`⚠️ Erreur chargement drapeau pour ${team.name}`);
                              e.target.src = france;
                            }}
                          />
                        </td>
                        <td>{team.name}</td>
                        <td>
                          <button
                            className="team-btn-delete"
                            onClick={() => handleEdit(team)}
                            title="Modifier"
                          >
                            ✏️
                          </button>
                          <button
                            className="team-btn-delete"
                            onClick={() => handleDelete(team.id)}
                            title="Supprimer"
                          >
                            🗑️
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="team-modal-overlay" onClick={handleCloseModal}>
          <div className="team-modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="team-modal-header">
              <h2 className="team-modal-title">
                {isEditing ? "Modifier l'équipe" : "Ajouter une nouvelle équipe"}
              </h2>
              <button className="team-modal-close" onClick={handleCloseModal}>
                &times;
              </button>
            </div>
            
            <form className="team-modal-form" onSubmit={handleSubmitTeam}>
              <div className="team-form-group">
                <label htmlFor="teamName">Nom de l'équipe *</label>
                <input
                  type="text"
                  id="teamName"
                  value={newTeam.name}
                  onChange={handleNameChange}
                  placeholder="Ex: France, Brésil..."
                  required
                  disabled={isSubmitting}
                />
                
                <label htmlFor="teamFlag">Drapeau de l'équipe (optionnel)</label>
                <input
                  type="file"
                  id="teamFlag"
                  accept="image/*"
                  onChange={handleFileChange}
                  disabled={isSubmitting}
                />
                
                {newTeam.flagPreview && (
                  <div className="flag-preview-container">
                    <p>Aperçu:</p>
                    <img
                      src={newTeam.flagPreview}
                      alt="Aperçu drapeau"
                      className="team-flag-preview"
                    />
                  </div>
                )}
              </div>
              
              {formError && (
                <div className="form-error">
                  ❌ {formError}
                </div>
              )}
              
              <div className="team-form-actions">
                <button 
                  type="button" 
                  className="team-btn-cancel" 
                  onClick={handleCloseModal}
                  disabled={isSubmitting}
                >
                  Annuler
                </button>
                <button 
                  type="submit" 
                  className="team-btn-submit"
                  disabled={isSubmitting || !newTeam.name.trim()}
                >
                  {isSubmitting ? (
                    <span className="loading-text">⏳ Traitement...</span>
                  ) : isEditing ? (
                    "Modifier"
                  ) : (
                    "Ajouter équipe"
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Teams;