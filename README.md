# WorldCup Pronostics — Test et validation

Application web de pronostics de matchs de Coupe du monde, support du mini-projet **Test et validation des logiciels** (Licence 3).
Réalisé par **Nour Bouchnak**.

## Architecture

| Couche | Technologie | Dossier | Adresse |
| --- | --- | --- | --- |
| Front-end | React | `src/` | http://localhost:3000 |
| API REST | ASP.NET Core (.NET 10) | `backend/` | http://localhost:5000 |
| Base de données | SQL Server LocalDB (`MyAppDb`) | — | — |

## Lancer l'application

```bash
# 1. API (dans un premier terminal)
cd backend
dotnet run

# 2. Front-end (dans un second terminal, à la racine)
npm install
npm start
```

Comptes de test : `admin` / `admin123`, `user1` / `user123`.

## Organisation du dépôt

```text
backend/        API ASP.NET Core
src/            Front-end React
tests/          Tests automatisés (unitaires, intégration, API, interface, performance)
docs/           Dossier de test (un livrable par semaine) et preuves d'exécution
.github/        Intégration continue (GitHub Actions)
```

## Lancer les tests

| Type | Commande | Semaine |
| --- | --- | --- |
| Unitaires | `dotnet test tests/Backend.UnitTests` | 6 |
| Intégration | `dotnet test tests/Backend.IntegrationTests` | 7 |
| API | `npx newman run tests/api/worldcup.postman_collection.json` | 8 |
| Interface | `npx playwright test` | 9 |
| Performance | `k6 run tests/performance/matches.js` | 9 |

## Règles de travail

- `main` = version stable ; une branche par type de test, fusionnée quand les tests passent.
- Commits préfixés : `test:`, `fix:`, `docs:`.
- Chaque anomalie = une issue GitHub (étiquette `bug`, sévérité, priorité).
