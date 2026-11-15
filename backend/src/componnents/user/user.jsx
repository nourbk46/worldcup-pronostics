import React, { useState } from "react";
import SidebarUser from "./sidebar";
import backg from "../Assets/backg.png";
import logo from "../Assets/logo.png";
import foot from "../Assets/football.png";
import "./userPage.css";

const User = () => {
  const [userData, setUserData] = useState({
    name: "Nour_bk",
    score: 48
  });

  // Ajout des données des utilisateurs pour le classement
  const [users, setUsers] = useState([
    { id: 1, name: "Nour_bk", score: 48, isCurrentUser: true },
    { id: 2, name: "Ahmed_m", score: 42, isCurrentUser: false },
    { id: 3, name: "Sara_t", score: 39, isCurrentUser: false },
    { id: 4, name: "Karim_l", score: 37, isCurrentUser: false },
    { id: 5, name: "Leila_k", score: 35, isCurrentUser: false },
    { id: 6, name: "Mohamed_s", score: 33, isCurrentUser: false },
    { id: 7, name: "Fatima_z", score: 30, isCurrentUser: false },
    { id: 8, name: "Youssef_b", score: 28, isCurrentUser: false },
    { id: 9, name: "Hana_c", score: 25, isCurrentUser: false },
    { id: 10, name: "Omar_d", score: 22, isCurrentUser: false }
  ]);

  // Matchs avec scores réels et pronostics séparés
  const [matches, setMatches] = useState([
    { 
      id: 1, 
      team1: "Mexique", 
      team2: "Afrique du Sud", 
      date: "12-06-2026 21:00", 
      actualScore1: 0, 
      actualScore2: 0, 
      userPrediction1: 2,
      userPrediction2: 1,
      status: "à venir"
    },
    { 
      id: 2, 
      team1: "République de Corée", 
      team2: "DEN/MKD/CZE/IRL", 
      date: "12-06-2026 04:00", 
      actualScore1: 0, 
      actualScore2: 0, 
      userPrediction1: null,
      userPrediction2: null,
      status: "à venir"
    },
    { 
      id: 3, 
      team1: "Canada", 
      team2: "ITA/NIR/WAL/BIH", 
      date: "12-06-2026 21:00", 
      actualScore1: 2, 
      actualScore2: 1, 
      userPrediction1: 3,
      userPrediction2: 0,
      status: "terminé"
    },
    { 
      id: 4, 
      team1: "États-Unis", 
      team2: "Paraguay", 
      date: "13-06-2026 03:00", 
      actualScore1: 0, 
      actualScore2: 0, 
      userPrediction1: 1,
      userPrediction2: 0,
      status: "à venir"
    },
    { 
      id: 5, 
      team1: "Qatar", 
      team2: "Suisse", 
      date: "13-06-2026 21:00", 
      actualScore1: 0, 
      actualScore2: 0, 
      userPrediction1: null,
      userPrediction2: null,
      status: "à venir"
    },
    { 
      id: 6, 
      team1: "Brésil", 
      team2: "Maroc", 
      date: "14-06-2026 00:00", 
      actualScore1: 0, 
      actualScore2: 0, 
      userPrediction1: 3,
      userPrediction2: 2,
      status: "à venir"
    }
  ]);

  // Données des drapeaux
  const [teams] = useState([
    { id: 1, name: "Afrique du sud", flag: require("../Assets/flags/AfDuS.png") },
    { id: 2, name: "Bosnie", flag: require("../Assets/flags/bosnie.svg") },
    { id: 3, name: "Bresil", flag: require("../Assets/flags/bresil.jfif") },
    { id: 4, name: "Canada", flag: require("../Assets/flags/canada.png") },
    { id: 5, name: "Etat-Unis", flag: require("../Assets/flags/etat.jfif") },
    { id: 6, name: "Maroc", flag: require("../Assets/flags/maroc.png") },
    { id: 7, name: "Macedoine", flag: require("../Assets/flags/mecadonie.png") },
    { id: 8, name: "Mexique", flag: require("../Assets/flags/mexique.png") },
    { id: 9, name: "Espagne", flag: require("../Assets/flags/espagne.png") },
    { id: 10, name: "Tunisie", flag: require("../Assets/flags/tunisie.png") },
    { id: 11, name: "Uruguay", flag: require("../Assets/flags/uruguay.jpg") },
    { id: 12, name: "Turquie", flag: require("../Assets/flags/turc.jpg") },
    { id: 13, name: "Ukraine", flag: require("../Assets/flags/ukraine.png") },
    { id: 14, name: "Suisse", flag: require("../Assets/flags/suisse.jpg") },
    { id: 15, name: "Senegal", flag: require("../Assets/flags/senegal.png") },
    { id: 16, name: "Republique Du Corée", flag: require("../Assets/flags/repDuCore.webp") },
    { id: 17, name: "Qatar", flag: require("../Assets/flags/qatar.jfif") },
    { id: 18, name: "Paraguay", flag: require("../Assets/flags/paraguay.jpg") },
    { id: 19, name: "Nouvelle Zélande", flag: require("../Assets/flags/nouvZelande.png") },
    { id: 20, name: "Norvège", flag: require("../Assets/flags/norvege.png") },
    { id: 21, name: "Jordanie", flag: require("../Assets/flags/jordanie.png") },
    { id: 22, name: "Japon", flag: require("../Assets/flags/japon.png") },
    { id: 23, name: "Iran", flag: require("../Assets/flags/iran.jpg") },
    { id: 24, name: "Haiti", flag: require("../Assets/flags/haiti.jpg") },
    { id: 25, name: "France", flag: require("../Assets/flags/france.jpg") },
    { id: 26, name: "Equateur", flag: require("../Assets/flags/equateur.png") },
    { id: 27, name: "Ecosse", flag: require("../Assets/flags/ecosse.png") },
    { id: 28, name: "Curacao", flag: require("../Assets/flags/curacao.png") },
    { id: 29, name: "Croatie", flag: require("../Assets/flags/croatie.png") },
    { id: 30, name: "Cote", flag: require("../Assets/flags/cote.png") },
    { id: 31, name: "cap Vert", flag: require("../Assets/flags/capVert.png") },
    { id: 32, name: "Belgique", flag: require("../Assets/flags/belgique.jpg") },
    { id: 33, name: "Australie", flag: require("../Assets/flags/australie.jpg") },
    { id: 34, name: "Arabi Saoudite", flag: require("../Assets/flags/arabie Saoudite.png") },
    { id: 35, name: "Allemagne", flag: require("../Assets/flags/allemagne.jpg") },
    { id: 36, name: "Algerie", flag: require("../Assets/flags/algerie.jfif") },
  ]);

  // Fonction pour trouver le drapeau
  const findTeamFlag = (teamName) => {
    const teamMapping = {
      "Mexique": "Mexique",
      "Afrique du Sud": "Afrique du sud",
      "République de Corée": "Republique Du Corée",
      "Canada": "Canada",
      "Paraguay": "Paraguay",
      "Qatar": "Qatar",
      "Suisse": "Suisse",
      "Brésil": "Bresil",
      "Maroc": "Maroc",
      "Haïti": "Haiti",
      "Écosse": "Ecosse",
      "Australie": "Australie",
      "Allemagne": "Allemagne",
      "Curaçao": "Curacao",
      "Japon": "Japon",
      "Côte d'Ivoire": "Cote",
      "Équateur": "Equateur",
      "Tunisie": "Tunisie",
      "Espagne": "Espagne",
      "Cap-Vert": "cap Vert",
      "Belgique": "Belgique",
      "Arabie saoudite": "Arabi Saoudite",
      "Uruguay": "Uruguay",
      "Iran": "Iran",
      "Nouvelle-Zélande": "Nouvelle Zélande",
      "France": "France",
      "Sénégal": "Senegal",
      "Norvège": "Norvège",
      "Algérie": "Algerie",
      "Jordanie": "Jordanie",
      "Croatie": "Croatie"
    };

    const normalizedTeamName = teamMapping[teamName] || teamName;
    const foundTeam = teams.find(team =>
      team.name.toLowerCase() === normalizedTeamName.toLowerCase()
    );

    return foundTeam ? foundTeam.flag : null;
  };

  // Formatage de la date
  const formatDateTime = (dateTimeString) => {
    const [datePart, timePart] = dateTimeString.split(' ');
    const [day, month, year] = datePart.split('-');
    
    const formattedDate = new Date(`${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}T${timePart}:00`);
    
    if (isNaN(formattedDate.getTime())) {
      return {
        date: datePart,
        time: timePart,
        dayName: ""
      };
    }
    
    return {
      date: formattedDate.toLocaleDateString('fr-FR', { 
        day: 'numeric', 
        month: 'short',
        year: 'numeric'
      }),
      time: timePart,
      dayName: formattedDate.toLocaleDateString('fr-FR', { weekday: 'short' })
    };
  };

  // Gestion du changement de pronostic
  const handlePredictionChange = (matchId, team, value) => {
    const numValue = value === '' ? null : parseInt(value);
    
    setMatches(prevMatches => 
      prevMatches.map(match => {
        if (match.id === matchId) {
          return {
            ...match,
            [team]: numValue
          };
        }
        return match;
      })
    );
  };

  // Fonction pour afficher le score réel avec style selon le statut
  const getActualScoreStyle = (status) => {
    if (status === "terminé") {
      return { color: "#4CAF50", fontWeight: "bold" };
    }
    return { color: "#666", opacity: 0.8 };
  };

  // Trier les utilisateurs par score décroissant
  const sortedUsers = [...users].sort((a, b) => b.score - a.score);

  return (
    <div className="admin-layout">
      <SidebarUser />
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
                A l'occasion du Coupe du monde des Nations, nous lançons un jeu de pronostics interne
                pour allier passion du football et esprit d'équipe.<br />
                <strong>Qui sera le meilleur analyste sportif de l'entreprise ?</strong>
              </p>
            </div>
          </div>
          
          <div className="contentWrapper">
            {/* Section gauche avec les matchs */}
            <div className="left-section">
              <div className="user-info-box">
                <div className="user-info-content">
                  <div className="user-name-section">
                    <span className="user-name-value">{userData.name}</span>
                  </div>
                  <div className="user-score-section">
                    <span className="user-score-label">Score:</span>
                    <span className="user-score-value">
                      {userData.score}
                      <img src={foot} alt="foot" className="foot" />
                    </span>
                  </div>
                </div>
              </div>

              <div className="matches-section">
                <div className="matches-container">
                  {matches.map(match => {
                    const { date, time } = formatDateTime(match.date);
                    const team1Flag = findTeamFlag(match.team1);
                    const team2Flag = findTeamFlag(match.team2);
                    
                    return (
                      <div key={match.id} className="match-card">
                        {/* En-tête */}
                        <div className="match-header">
                          <span className="match-status">{match.status}</span>
                          <span className="match-date">{date} • {time}</span>
                        </div>

                        {/* Corps du match */}
                        <div className="match-body">
                          {/* Équipe 1 */}
                          <div className="team team-left">
                            <div className="team-flag">
                              <img 
                                src={team1Flag || ""}
                                alt={match.team1}
                                className="flag-icon"
                              />
                            </div>
                            <div className="team-name">{match.team1}</div>
                            <div className="team-score">{match.actualScore1}</div>
                          </div>

                          <div className="match-vs">VS</div>

                          {/* Équipe 2 */}
                          <div className="team team-right">
                            <div className="team-score">{match.actualScore2}</div>
                            <div className="team-name">{match.team2}</div>
                            <div className="team-flag">
                              <img 
                                src={team2Flag || ""}
                                alt={match.team2}
                                className="flag-icon"
                              />
                            </div>
                          </div>
                        </div>

                        {/* Inputs de pronostic SIMPLES */}
                        <div className="prediction-inputs">
                          <div className="prediction-input">
                            <input
                              type="number"
                              value={match.userPrediction1 !== null ? match.userPrediction1 : ''}
                              onChange={(e) => handlePredictionChange(match.id, 'userPrediction1', e.target.value)}
                              min="0"
                              max="20"
                              placeholder="?"
                            />
                          </div>
                          
                          <div className="separator">-</div>
                          
                          <div className="prediction-input">
                            <input
                              type="number"
                              value={match.userPrediction2 !== null ? match.userPrediction2 : ''}
                              onChange={(e) => handlePredictionChange(match.id, 'userPrediction2', e.target.value)}
                              min="0"
                              max="20"
                              placeholder="?"
                            />
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Section droite avec le classement */}
            <div className="right-section">
              <div className="ranking-container">
                <h2 className="ranking-title">Classement des collaborateurs</h2>
                <div className="ranking-table">
                  <div className="ranking-header">
                    <div className="header-name">Utilisateur</div>
                    <div className="header-score">Score</div>
                  </div>
                  
                  {sortedUsers.map((user, index) => (
                    <div 
                      key={user.id} 
                      className={`ranking-row ${user.isCurrentUser ? 'current-user' : ''}`}
                    >
                      <div className="row-rank">{index + 1}</div>
                      <div className="row-name">
                        {user.name}
                        {user.isCurrentUser && <span className="you-badge"> (vous)</span>}
                      </div>
                      <div className="row-score">
                        {user.score}
                        <img src={foot} alt="foot" className="footSmall" />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default User;