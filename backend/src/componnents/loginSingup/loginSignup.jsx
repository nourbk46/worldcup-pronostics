import "./loginSignup.css";
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import cupImage from "../Assets/login.png";
import fotball from "../Assets/football.png";

const LoginSignup = () => {
  const navigate = useNavigate();

  const [login, setLogin] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  // URL de votre API .NET
const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';
  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    // Validation
    if (!login.trim() || !password.trim()) {
      setError("Veuillez remplir tous les champs");
      setLoading(false);
      return;
    }

    try {
      console.log(`Tentative de connexion: ${login}`);
      
      const response = await fetch(`${API_URL}/api/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          login: login.trim(),
          password: password.trim()
        }),
      });

      console.log("Réponse API - Status:", response.status);
      
      // Lire la réponse
      const responseText = await response.text();
      console.log("Réponse API - Texte:", responseText);

      if (!response.ok) {
        let errorMessage = "Erreur de connexion";
        
        try {
          const errorData = JSON.parse(responseText);
          errorMessage = errorData.message || errorMessage;
        } catch {
          errorMessage = responseText || `Erreur ${response.status}`;
        }
        
        throw new Error(errorMessage);
      }

      // Connexion réussie
      const userData = JSON.parse(responseText);
      console.log("Connexion réussie - Données:", userData);
      
      // IMPORTANT: Votre API retourne "role" (minuscule)
      const userRole = userData.role || userData.Role || "user";
      const normalizedRole = userRole.toLowerCase().trim();
      console.log("Rôle normalisé:", normalizedRole);
      
      // Stocker les informations
      localStorage.setItem("token", userData.token || userData.Token || `token-${Date.now()}`);
      localStorage.setItem("userLogin", userData.login || userData.Login || login);
      localStorage.setItem("userRole", normalizedRole);
      localStorage.setItem("userId", userData.id || userData.Id || "0");
      localStorage.setItem("userScore", userData.score || userData.Score || "0");
      localStorage.setItem("isAuthenticated", "true");

      // Vérification finale
      console.log("=== VERIFICATION FINALE ===");
      console.log("Rôle API:", userData.role);
      console.log("Rôle stocké:", localStorage.getItem("userRole"));
      console.log("Login stocké:", localStorage.getItem("userLogin"));

      // Redirection
      if (normalizedRole === "admin") {
        console.log("✅ ADMIN - Redirection vers /Admin/users");
        navigate("/Admin/users");
      } else {
        console.log("✅ USER - Redirection vers /user/user");
        navigate("/user/user");
      }

    } catch (error) {
      console.error("❌ Erreur d'authentification:", error);
      
      if (error.message.includes("Failed to fetch")) {
        setError(`API non accessible. Vérifiez que .NET est démarré sur ${API_URL}`);
      } else {
        setError(error.message);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page">
      
      <div className="logo">
        <img src={fotball} alt="football logo" />
      </div>

      <div className="container">
        <form className="form-content" onSubmit={handleLogin}>
          
          <div className="header">
            <div className="text">
              <h2>Bienvenue!</h2>
              <p>Application interne réservée aux collaborateurs NEOSYS</p>
            </div>
            <div className="underline"></div>
          </div>

          <div className="inputs">
            <div className="input">
              <input
                type="text"
                placeholder="Login (ex: admin2)"
                value={login}
                onChange={(e) => setLogin(e.target.value)}
                required
                disabled={loading}
              />
            </div>

            <div className="input">
              <input
                type="password"
                placeholder="Mot de passe"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                disabled={loading}
              />
            </div>
          </div>

          {error && (
            <div className="error-message">
              <strong>Erreur:</strong> {error}
            </div>
          )}

          <div className="submit">
            <button 
              type="submit" 
              className="submit"
              disabled={loading}
            >
              {loading ? "Connexion..." : "Connectez-vous"}
            </button>
          </div>

        </form>
      </div>

      <div className="login-image">
        <img src={cupImage} alt="World Cup" />
      </div>

    </div>
  );
};

export default LoginSignup;