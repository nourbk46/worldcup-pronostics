import React, { useState, useEffect } from "react";
import "./Sidebar.css";
import Sidebar from "./Sidebar";
import backg from "../Assets/backg.png";
import logo from "../Assets/logo.png";
import "./teams.css";

// Importez toutes les images
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
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim();


// MAPPING DES DRAPEAUX
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
  [normalize("Côte d’Ivoire")]: cote,
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

  // Fonction pour obtenir le drapeau
 const getFlagForTeam = (teamName) => {
  return FLAG_MAPPING[normalize(teamName)] || null;
};


  // Charger les équipes depuis l'API
  useEffect(() => {
    fetchTeams();
  }, []);

  const fetchTeams = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_URL}/teams`);
      
      if (!response.ok) {
        throw new Error(`Erreur ${response.status}`);
      }
      
      const data = await response.json();
      
      // Ajouter les drapeaux aux données de l'API
      const teamsWithFlags = data.map(team => ({
        ...team,
        flag: getFlagForTeam(team.name)
      }));
      
      setTeams(teamsWithFlags);
      setApiError("");
    } catch (err) {
      console.error("Erreur API:", err);
      setApiError("Impossible de charger depuis l'API. Utilisation des données locales.");
      
      // Utiliser les données locales en fallback
      const localTeams = Object.entries(FLAG_MAPPING)
        .filter(([key]) => key !== "default")
        .map(([name, flag], index) => ({
          id: index + 1,
          name: name,
          flag: flag
        }));
      
      setTeams(localTeams);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenModal = () => setShowModal(true);
  
  const handleCloseModal = () => {
    setShowModal(false);
    setNewTeam({
      name: "",
      flag: null,
      flagPreview: null
    });
    setFormError("");
  };

  const handleNameChange = (e) => {
    setNewTeam({
      ...newTeam,
      name: e.target.value
    });
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const validTypes = ['image/jpeg', 'image/png', 'image/jpg', 'image/svg+xml', 'image/webp'];
      if (!validTypes.includes(file.type)) {
        setFormError("Veuillez sélectionner une image valide (JPG, PNG, SVG, WebP)");
        return;
      }

      if (file.size > 2 * 1024 * 1024) {
        setFormError("L'image ne doit pas dépasser 2MB");
        return;
      }

      setFormError("");
      const reader = new FileReader();
      reader.onloadend = () => {
        setNewTeam({
          ...newTeam,
          flag: file,
          flagPreview: reader.result
        });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAddTeam = async (e) => {
    e.preventDefault();
    
    if (!newTeam.name.trim()) {
      setFormError("Le nom de l'équipe est requis");
      return;
    }

    try {
      const teamData = {
        name: newTeam.name.trim()
      };

      const response = await fetch(`${API_URL}/teams`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(teamData)
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || `Erreur ${response.status}`);
      }

      const createdTeam = await response.json();
      
      // Ajouter l'équipe avec son drapeau
      const teamWithFlag = {
        ...createdTeam,
        flag: newTeam.flagPreview || getFlagForTeam(createdTeam.name)
      };
      
      setTeams([...teams, teamWithFlag]);
      handleCloseModal();
      alert(`Équipe "${createdTeam.name}" ajoutée avec succès!`);
      
    } catch (err) {
      console.error("Erreur lors de l'ajout:", err);
      setFormError(err.message || "Erreur lors de l'ajout de l'équipe");
    }
  };
const handleDelete = async (teamId) => {
    const team = teams.find(t => t.id === teamId);
    
    if (!window.confirm(`Supprimer l'équipe "${team?.name}" ?`)) {
        return;
    }

    try {
        console.log(`Tentative suppression équipe ${teamId}...`);
        
        const response = await fetch(`${API_URL}/teams/${teamId}`, {
            method: "DELETE",
            headers: {
                'Accept': 'application/json'
            }
        });

        console.log("Status:", response.status);
        
        // Lire la réponse
        const responseText = await response.text();
        console.log("Réponse texte:", responseText);
        
        let responseData = {};
        if (responseText) {
            try {
                responseData = JSON.parse(responseText);
            } catch (parseError) {
                console.warn("Réponse non-JSON:", responseText);
            }
        }

        if (response.ok) {
            // ✅ SUCCÈS - Supprimer de la liste
            setTeams(teams.filter(t => t.id !== teamId));
            
            // Afficher le message de l'API
            const successMessage = responseData.message || `Équipe "${team?.name}" supprimée avec succès`;
            alert(successMessage);
            
            console.log("✅ Suppression réussie!");
        } else {
            // ❌ ERREUR
            const errorMsg = responseData.message || 
                            responseData.error || 
                            `Erreur ${response.status}: ${response.statusText}`;
            throw new Error(errorMsg);
        }
        
    } catch (err) {
        console.error("❌ Erreur détaillée:", err);
        alert(`Échec de la suppression: ${err.message}`);
    }
};

  return (
    <div className="team-layout">
      <Sidebar />
      <div className="team-main">
        <div className="team-content">
          <div className="team-back-image">
            <img src={backg} alt="background" />
            <div className="logo-overlay">
              <img src={logo} alt="Neosys Logo" className="logo-right" />
            </div>
            <div className="team-image-text-content">
              <h1 className="team-image-title">Challenge Pronostics AFCON - Neosys</h1>
              <p className="team-image-subtitle">
                A l'occasion du Coupe du monde des Nations , nous lançons un jeu de pronostics interne
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
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {teams.map((team) => (
                    <tr key={team.id}>
                     <td>
                        {team.flag && (
                          <img
                            src={team.flag}
                            alt={`Drapeau ${team.name}`}
                            className="team-flag"
                          />
                        )}
                      </td>
                      <td>{team.name}</td>
                      <td>
                        <button
                          className="team-btn-delete"
                          onClick={() => handleDelete(team.id)}
                          title="Supprimer"
                        >
                          🗑️
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              
              {teams.length === 0 && !loading && (
                <div className="no-data">
                  <p>Aucune équipe trouvée. Ajoutez votre première équipe !</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="team-modal-overlay" onClick={handleCloseModal}>
          <div className="team-modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="team-modal-header">
              <h2 className="team-modal-title">Ajouter une nouvelle équipe</h2>
              <button className="team-modal-close" onClick={handleCloseModal}>
                &times;
              </button>
            </div>
            
            <form className="team-modal-form" onSubmit={handleAddTeam}>
              <div className="team-form-group">
                <label htmlFor="teamName">Nom de l'équipe *</label>
                <input
                  type="text"
                  id="teamName"
                  value={newTeam.name}
                  onChange={handleNameChange}
                  placeholder="Ex: France, Brésil..."
                  required
                />
              </div>
              
              {formError && (
                <div className="form-error">
                  {formError}
                </div>
              )}
              
              <div className="team-form-actions">
                <button 
                  type="button" 
                  className="team-btn-cancel" 
                  onClick={handleCloseModal}
                >
                  Annuler
                </button>
                <button type="submit" className="team-btn-submit">
                  Ajouter l'équipe
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