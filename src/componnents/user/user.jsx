import React, { useState, useEffect, useRef } from "react";
import SidebarUser from "./sidebar";
import backg from "../Assets/photoF.jpeg";
import foot from "../Assets/football.png";
import "./userPage.css";
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

// Fonction de normalisation pour les noms d'équipes
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
  [normalize("Côte d'Ivoire")]: cote,
  [normalize("Cap-Vert")]: capVert,
  [normalize("Belgique")]: belgique,
  [normalize("Australie")]: australie,
  [normalize("Arabie Saoudite")]: arabie,
  [normalize("Allemagne")]: allemagne,
  [normalize("Algérie")]: algerie,
};

const User = () => {
  const [currentUser, setCurrentUser] = useState(null);
const [users, setUsers] = useState([]);
const [matches, setMatches] = useState([]);

// ✅ séparation claire
const [userPronostics, setUserPronostics] = useState([]);
const [allPronostics, setAllPronostics] = useState([]);
// Saisie en cours des pronostics (avant que les 2 scores soient remplis)
const [drafts, setDrafts] = useState({});

const [loading, setLoading] = useState(true);
const [error, setError] = useState("");
const [dataLoaded, setDataLoaded] = useState(false);
const [currentTime, setCurrentTime] = useState(new Date());

const firstUpcomingRef = useRef(null);
const [hasScrolled, setHasScrolled] = useState(false);




useEffect(() => {
  const interval = setInterval(() => {
    setCurrentTime(new Date());
  }, 60000); 
  return () => clearInterval(interval);
}, []);


  useEffect(() => {
    if (dataLoaded && firstUpcomingRef.current && !hasScrolled) {
      setTimeout(() => {
        firstUpcomingRef.current.scrollIntoView({
          behavior: 'smooth',
          block: 'center',
        });
        setHasScrolled(true);
      }, 500);
    }
  }, [dataLoaded, hasScrolled]);

 const getMatchStatus = (match) => {
  if (!match.date) return match.status || "à venir";

  const matchDate = new Date(match.date);
  const MATCH_DURATION_MS = 2 * 60 * 60 * 1000; // un match dure ~2h (avec mi-temps et arrêts de jeu)
  const matchEnd = new Date(matchDate.getTime() + MATCH_DURATION_MS);

  if (match.status === "terminé") return "terminé";
  if (currentTime >= matchEnd) return "terminé";
  if (currentTime >= matchDate) return "en cours";
  return "à venir";
};

const isPredictionAllowed = (match) => {
  if (!match.date) return false;

  const now = new Date();
  const matchDate = new Date(match.date);
  const pronosticCloseMinutes = match.pronosticCloseMinutes ?? 120;
  const cutoffTime = new Date(matchDate.getTime() - pronosticCloseMinutes * 60 * 1000);
  return now < cutoffTime;
};


  useEffect(() => {
    const checkUserFromLocalStorage = () => {
      const savedUser = localStorage.getItem('currentUser');
      
      if (savedUser) {
        try {
          const userData = JSON.parse(savedUser);
          console.log("Utilisateur récupéré depuis localStorage:", userData);
          setCurrentUser(userData);
        } catch (error) {
          console.error("Erreur parsing localStorage:", error);
          setError("Erreur de session. Veuillez vous reconnecter.");
          redirectToLogin();
        }
      } else {
        console.log("Aucun utilisateur trouvé dans localStorage");
        setError("Vous devez vous connecter pour accéder à cette page.");
        redirectToLogin();
      }
    };

    const redirectToLogin = () => {
      setTimeout(() => {
        window.location.href = "/loginSignup";
      }, 2000);
    };

    checkUserFromLocalStorage();
  }, []);

  useEffect(() => {
    if (currentUser && currentUser.id && !dataLoaded) {
      console.log("Chargement des données pour:", currentUser);
      fetchUserData();
    }
  }, [currentUser, dataLoaded]);
  useEffect(() => {
  if (currentUser) {
    const total = userPronostics.reduce(
      (acc, p) => acc + (p.points || 0),
      0
    );

    setCurrentUser(prev => ({
      ...prev,
      totalPoints: total
    }));
  }
}, [userPronostics]);


const fetchUserData = async () => {
  try {
    setLoading(true);

    const userId = currentUser.id;

    // Convertit la réponse de l'API en tableau (gère erreurs et format {$values: [...]})
    const toArray = (data) =>
      Array.isArray(data) ? data : Array.isArray(data?.$values) ? data.$values : [];

    const usersResponse = await fetch(`${API_URL}/Users`);
    const allUsers = await usersResponse.json();
    setUsers(toArray(allUsers));

    const matchesResponse = await fetch(`${API_URL}/Matches`);
    const matchesJson = await matchesResponse.json().catch(() => null);
    if (!matchesResponse.ok) {
      console.error("Erreur API /Matches :", matchesJson);
      throw new Error(matchesJson?.message || `Erreur ${matchesResponse.status} lors du chargement des matchs`);
    }
    const matchesData = [...toArray(matchesJson)].sort(
      (a, b) => new Date(a.date) - new Date(b.date)
    );
    setMatches(matchesData);

    const allPronosticsResponse = await fetch(`${API_URL}/Pronostics`);
const allPronosticsData = await allPronosticsResponse.json();
setAllPronostics(
  Array.isArray(allPronosticsData) ? allPronosticsData : []
);


    const userPronosticsResponse = await fetch(
      `${API_URL}/Pronostics/user/${userId}`
    );
    if (userPronosticsResponse.ok) {
      setUserPronostics(toArray(await userPronosticsResponse.json()));
    } else {
      setUserPronostics([]);
    }

    setDataLoaded(true);
    setError("");
  } catch (err) {
    setError(err.message);
  } finally {
    setLoading(false);
  }
};


  const getTeamFlag = (teamName) => {
    if (!teamName) return france;
    
    const normalizedTeamName = normalize(teamName);
    
    for (const [key, flag] of Object.entries(FLAG_MAPPING)) {
      if (normalizedTeamName.includes(key) || key.includes(normalizedTeamName)) {
        return flag;
      }
    }
    
    const searchTerms = normalizedTeamName.split(' ');
    for (const term of searchTerms) {
      for (const [key, flag] of Object.entries(FLAG_MAPPING)) {
        if (key.includes(term) && term.length > 2) {
          return flag;
        }
      }
    }
    
    console.warn(`Drapeau non trouvé pour: ${teamName}, utilisation du drapeau par défaut`);
    return france;
  };

  const getPronosticForMatch = (matchId) => {
  return userPronostics.find(p => p.matchId === matchId);
};

  const savePronostic = async (matchId, score1, score2) => {
  const response = await fetch(`${API_URL}/Pronostics`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      userId: currentUser.id,
      matchId,
      score1,
      score2
    })
  });

  if (!response.ok) {
    const err = await response.json();
    throw new Error(err.message);
  }

  const userData = await fetch(
    `${API_URL}/Pronostics/user/${currentUser.id}`
  ).then(r => r.json());
  setUserPronostics(Array.isArray(userData) ? userData : []);

  const allData = await fetch(`${API_URL}/Pronostics`).then(r => r.json());
  setAllPronostics(Array.isArray(allData) ? allData : []);
};

const handlePredictionChange = async (matchId, field, value) => {
  const match = matches.find(m => m.id === matchId);
  if (!match) return;

  if (!isPredictionAllowed(match)) {
    return;
  }

  // On garde la saisie localement pour que la case affiche bien ce qui est tapé
  const draft = { ...(drafts[matchId] || {}), [field]: value };
  setDrafts(prev => ({ ...prev, [matchId]: draft }));

  const existingPronostic = getPronosticForMatch(matchId);
  const pick = (f) => {
    const v = draft[f] !== undefined ? draft[f] : existingPronostic?.[f];
    return v === '' || v === null || v === undefined ? null : parseInt(v);
  };
  const newScore1 = pick('score1');
  const newScore2 = pick('score2');

  // On n'envoie que quand les 2 scores sont remplis
  if (newScore1 === null || newScore2 === null || isNaN(newScore1) || isNaN(newScore2)) return;

  try {
    await savePronostic(matchId, newScore1, newScore2);
    setDrafts(prev => { const c = { ...prev }; delete c[matchId]; return c; });
  } catch (err) {
    console.error(err);
    alert("Pronostic non enregistré : " + err.message);
  }
};




  const formatMatchDate = (dateString) => {
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return { date: dateString, time: "" };
      
      return {
        date: date.toLocaleDateString('fr-FR', { 
          day: 'numeric', 
          month: 'short',
          year: 'numeric'
        }),
        time: date.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })
      };
    } catch {
      return { date: dateString, time: "" };
    }
  };

const safeAllPronostics = Array.isArray(allPronostics)
  ? allPronostics
  : [];

const userPoints = safeAllPronostics.reduce((acc, p) => {
  if (!acc[p.userId]) acc[p.userId] = 0;
  acc[p.userId] += p.points || 0;
  return acc;
}, {});


useEffect(() => {
  if (!currentUser) return;

  const totalPoints = userPronostics.reduce(
    (acc, p) => acc + (p.points || 0),
    0
  );

  setCurrentUser(prev => ({
    ...prev,
    totalPoints
  }));
}, [userPronostics]);

const sortedUsers = [...users]
  .filter(user => user.role !== "admin")
  .map(user => ({
    ...user,
    totalPoints: userPoints[user.id] || 0
  }))
  .sort((a, b) => b.totalPoints - a.totalPoints);


  const handleLogout = () => {
    localStorage.removeItem('currentUser');
    localStorage.removeItem('token');
    window.location.href = "/loginSignup";
  };

  if (loading) {
    return (
      <div className="admin-layout">
        <SidebarUser />
        <div className="admin-main">
          <div className="loading-container">
            <div className="loading-spinner"></div>
            <p>Chargement de vos données...</p>
            {currentUser && <small>Utilisateur: {currentUser.login}</small>}
          </div>
        </div>
      </div>
    );
  }

  const finishedMatches = matches
    .filter(match => getMatchStatus(match) === "terminé")
    .sort((a, b) => new Date(b.date) - new Date(a.date)); 

  const liveMatches = matches
    .filter(match => getMatchStatus(match) === "en cours")
    .sort((a, b) => new Date(a.date) - new Date(b.date)); 

  const upcomingMatches = matches
    .filter(match => getMatchStatus(match) === "à venir")
    .sort((a, b) => new Date(a.date) - new Date(b.date)); 
  
  const firstUpcomingMatch = upcomingMatches.length > 0 ? upcomingMatches[0] : null;
  

  return (
    <div className="admin-layout">
      <SidebarUser />
      <div className="admin-main">
        <div className="admin-content">
          <div className="back-image">
            <img src={backg} alt="background" />
            <div className="image-text-content">
              <h1 className="image-title">Challenge Pronostics <p></p> Coupe du Monde 2026- Neosys</h1>
              <p className="image-subtitle">
                A l'occasion du Coupe du monde des Nations, nous lançons un jeu de pronostics interne
                pour allier passion du football et esprit d'équipe.<br />
                <strong>Qui sera le meilleur analyste sportif de l'entreprise ?</strong>
              </p>
            </div>
          </div>
          
          {error && (
            <div className="alert alert-danger">
              {error}
              <button onClick={fetchUserData} style={{ marginLeft: '10px' }}>
                Réessayer
              </button>
            </div>
          )}
          
          <div className="contentWrapper">
            <div className="left-section">
              <div className="user-info-box">
                <div className="user-info-content">
                  <div className="user-name-section">
                    <span className="user-name-value">{currentUser.login}</span>
                  </div>
                  <div className="user-score-section">
                    <span className="user-score-label">Score:</span>
                    <span className="user-score-value">
                      {currentUser.totalPoints}
                      <img src={foot} alt="foot" className="foot" />
                    </span>
                  </div>
                </div>
              </div>

              <div className="matches-section">
                {/* Section des matchs terminés */}
                {finishedMatches.length > 0 && (
                  <>
                    <div className="matches-container">
                      {finishedMatches.map(match => {
                        const { date, time } = formatMatchDate(match.date);
                        const userPronostic = getPronosticForMatch(match.id);
                        
                        return (
                          <div key={match.id} className="match-card finished-match">
                            <div className="match-header">
                              <span className="match-status finished">terminé</span>
                              <span className="match-date">{date} • {time}</span>
                            </div>

                            <div className="match-body">
                              <div className="team team-left">
                                <div className="team-flag">
                                  <img 
                                    src={getTeamFlag(match.team1Name)} 
                                    alt={match.team1Name}
                                    className="flag-icon"
                                    onError={(e) => {
                                      e.target.onerror = null;
                                      e.target.src = france;
                                    }}
                                  />
                                </div>
                                <div className="team-name">{match.team1Name}</div>
                                <div className="team-score actual-score">
                                  {match.score1 ?? 0}
                                </div>
                              </div>

                              <div className="match-vs">VS</div>

                              <div className="team team-right">
                                <div className="team-score actual-score">
                                  {match.score2 ?? 0}
                                </div>
                                <div className="team-name">{match.team2Name}</div>
                                <div className="team-flag">
                                  <img 
                                    src={getTeamFlag(match.team2Name)} 
                                    alt={match.team2Name}
                                    className="flag-icon"
                                    onError={(e) => {
                                      e.target.onerror = null;
                                      e.target.src = france;
                                    }}
                                  />
                                </div>
                              </div>
                            </div>
                            
                            {userPronostic && (
                              <div className="pronostic-result">
                                <small>
                                  Votre pronostic: {userPronostic.score1 ?? '?'} - {userPronostic.score2 ?? '?'} * points:{userPronostic.points ?? 0}
                                
                                </small>
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </>
                )}

                {/* Section des matchs en cours */}
                {liveMatches.length > 0 && (
                  <>
                    <div className="matches-container">
                      {liveMatches.map(match => {
                        const { date, time } = formatMatchDate(match.date);
                        const userPronostic = getPronosticForMatch(match.id);
                        
                        return (
                          <div key={match.id} className="match-card live-match">
                            <div className="match-header">
                              <span className="match-status en-cours">en cours</span>
                              <span className="match-date">{date} • {time}</span>
                            </div>

                            <div className="match-body">
                              <div className="team team-left">
                                <div className="team-flag">
                                  <img 
                                    src={getTeamFlag(match.team1Name)} 
                                    alt={match.team1Name}
                                    className="flag-icon"
                                    onError={(e) => {
                                      e.target.onerror = null;
                                      e.target.src = france;
                                    }}
                                  />
                                </div>
                                <div className="team-name">{match.team1Name}</div>
                                <div className="team-score actual-score">
                                  {match.score1 ?? 0}
                                </div>
                              </div>

                              <div className="match-vs">VS</div>

                              <div className="team team-right">
                                <div className="team-score actual-score">
                                  {match.score2 ?? 0}
                                </div>
                                <div className="team-name">{match.team2Name}</div>
                                <div className="team-flag">
                                  <img 
                                    src={getTeamFlag(match.team2Name)} 
                                    alt={match.team2Name}
                                    className="flag-icon"
                                    onError={(e) => {
                                      e.target.onerror = null;
                                      e.target.src = france;
                                    }}
                                  />
                                </div>
                              </div>
                            </div>

                            <div className="prediction-inputs disabled">
                              <div className="prediction-input">
                                <input
                                  type="number"
                                  value={userPronostic?.score1 ?? ''}
                                  onChange={(e) => handlePredictionChange(match.id, 'score1', e.target.value)}
                                  readOnly
                                  placeholder="?"
                                  disabled={!isPredictionAllowed(match)}
                                />
                              </div>
                              
                              <div className="separator">-</div>
                              
                              <div className="prediction-input">
                                <input
                                  type="number"
                                  value={userPronostic?.score2 ?? ''}
                                  onChange={(e) => handlePredictionChange(match.id, 'score2', e.target.value)}
                                  readOnly
                                  placeholder="?"
                                 disabled={!isPredictionAllowed(match)}
                                />
                              </div>
                            </div>
                            
                            {userPronostic && (
                              <div className="pronostic-result">
                                <small>
                                  Votre pronostic: {userPronostic.score1 ?? '?'} - {userPronostic.score2 ?? '?'}• points: {userPronostic.points ?? 0}
                                
                                </small>
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </>
                )}

                {/* Section des matchs à venir */}
                {upcomingMatches.length > 0 && (
                  <>
                    <div className="matches-container">
                      {upcomingMatches.map((match, index) => {
                        const { date, time } = formatMatchDate(match.date);
                        const userPronostic = getPronosticForMatch(match.id);
                        const isFirstUpcoming = firstUpcomingMatch && match.id === firstUpcomingMatch.id;
                        
                        return (
                          <div 
                            key={match.id} 
                            className="match-card upcoming-match" 
                            ref={isFirstUpcoming ? firstUpcomingRef : null}
                          >
                            <div className="match-header">
                          <span className={`match-status ${match.status.replace(' ', '-')}`}>
  {match.status}
</span>
                             
                          <span className="match-date">{date} • {time}</span>
                            </div>

                            <div className="match-body">
                              <div className="team team-left">
                                <div className="team-flag">
                                  <img 
                                    src={getTeamFlag(match.team1Name)} 
                                    alt={match.team1Name}
                                    className="flag-icon"
                                    onError={(e) => {
                                      e.target.onerror = null;
                                      e.target.src = france;
                                    }}
                                  />
                                </div>
                                <div className="team-name">{match.team1Name}</div>
                                <div className="team-score">
                                  {match.score1 ?? 0}
                                </div>
                              </div>

                              <div className="match-vs">VS</div>

                              <div className="team team-right">
                                <div className="team-score">
                                  {match.score2 ?? 0}
                                </div>
                                <div className="team-name">{match.team2Name}</div>
                                <div className="team-flag">
                                  <img 
                                    src={getTeamFlag(match.team2Name)} 
                                    alt={match.team2Name}
                                    className="flag-icon"
                                    onError={(e) => {
                                      e.target.onerror = null;
                                      e.target.src = france;
                                    }}
                                  />
                                </div>
                              </div>
                            </div>

                            <div className="prediction-inputs">
                              <div className="prediction-input">
                                <input
                                  type="number"
                                  value={drafts[match.id]?.score1 ?? userPronostic?.score1 ?? ''}
                                  onChange={(e) => handlePredictionChange(match.id, 'score1', e.target.value)}
                                  min="0"
                                  max="20"
                                  placeholder="?"
                                />
                              </div>
                              
                              <div className="separator">-</div>
                              
                              <div className="prediction-input">
                                <input
                                  type="number"
                                  value={drafts[match.id]?.score2 ?? userPronostic?.score2 ?? ''}
                                  onChange={(e) => handlePredictionChange(match.id, 'score2', e.target.value)}
                                  min="0"
                                  max="20"
                                  placeholder="?"
                                />
                              </div>
                            </div>
                            
                            {userPronostic && (
                              <div className="pronostic-result">
                                <small>
                                  Votre pronostic: {userPronostic.score1 ?? '?'} - {userPronostic.score2 ?? '?'}• points: {userPronostic.points ?? 0}
                               
                                </small>
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </>
                )}

                {matches.length === 0 && (
                  <div className="no-matches">
                    <p>Aucun match disponible</p>
                  </div>
                )}
              </div>
            </div>

            <div className="right-section">
              <div className="ranking-container">
                <h2 className="ranking-title">Classement des collaborateurs</h2>
                <div className="ranking-table">
                  <div className="ranking-header">
                    <div className="header-rank">#</div>
                    <div className="header-name">Utilisateur</div>
                    <div className="header-score">Score</div>
                  </div>
                  
                  {sortedUsers.map((user, index) => (
                    <div 
                      key={user.id} 
                      className={`ranking-row ${user.id === currentUser.id ? 'current-user' : ''}`}
                    >
                      <div className="row-rank">{index + 1}</div>
                      <div className="row-name">
                        {user.login}
                        {user.id === currentUser.id && <span className="you-badge"></span>}
                      </div>
                      <div className="row-score">
                         {user.totalPoints}
                        <img src={foot} alt="foot" className="footSmall" />
                      </div>
                    </div>
                  ))}
                </div>
                
                <div className="ranking-stats">
                  <p>Total joueurs: {sortedUsers.length}</p>
                  <p>Votre position: #{sortedUsers.findIndex(u => u.id === currentUser.id) + 1}</p>
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