using System;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using backend.Data;
using backend.Models;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace backend.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class PronosticsController : ControllerBase
    {
        private readonly AppDbContext _context;
        private readonly ILogger<PronosticsController> _logger;

        public PronosticsController(AppDbContext context, ILogger<PronosticsController> logger)
        {
            _context = context;
            _logger = logger;
        }

        // GET: api/Pronostics - Retourne TOUS les pronostics
        [HttpGet]
        public async Task<ActionResult<IEnumerable<object>>> GetPronostics()
        {
            try
            {
                var pronostics = await _context.Pronostics
                    .Include(p => p.User)
                    .Include(p => p.Match)
                        .ThenInclude(m => m.Team1)
                    .Include(p => p.Match)
                        .ThenInclude(m => m.Team2)
                    .ToListAsync();

                // Calculer les points pour chaque pronostic
                var result = pronostics.Select(p => new
                {
                    p.Id,
                    p.UserId,
                    userLogin = p.User?.Login ?? "Utilisateur inconnu",
                    p.MatchId,
                    matchName = p.Match != null ? $"{p.Match.Team1?.Name ?? "Équipe 1"} vs {p.Match.Team2?.Name ?? "Équipe 2"}" : "Match inconnu",
                    p.Score1,
                    p.Score2,
                    realScore1 = p.Match?.Score1,
                    realScore2 = p.Match?.Score2,
                    matchStatus = GetMatchStatus(p.Match),
                    points = CalculatePoints(p) // Points calculés pour ce pronostic
                }).ToList();

                _logger.LogInformation($"Récupéré {result.Count} pronostics pour tous les utilisateurs");
                return Ok(result);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Erreur lors de la récupération des pronostics");
                return StatusCode(500, new { message = "Erreur serveur", error = ex.Message });
            }
        }

        // GET: api/Pronostics/user/{userId} - Pronostics pour un utilisateur spécifique
        [HttpGet("user/{userId}")]
        public async Task<ActionResult<IEnumerable<object>>> GetPronosticsByUser(int userId)
        {
            if (userId <= 0)
                return BadRequest(new { message = "Utilisateur invalide" });

            try
            {
                var pronostics = await _context.Pronostics
                    .Where(p => p.UserId == userId)
                    .Include(p => p.User)
                    .Include(p => p.Match)
                        .ThenInclude(m => m.Team1)
                    .Include(p => p.Match)
                        .ThenInclude(m => m.Team2)
                    .ToListAsync();

                var result = pronostics.Select(p => new
                {
                    p.Id,
                    p.UserId,
                    userLogin = p.User?.Login ?? "Utilisateur inconnu",
                    p.MatchId,
                    matchName = p.Match != null ? $"{p.Match.Team1?.Name ?? "Équipe 1"} vs {p.Match.Team2?.Name ?? "Équipe 2"}" : "Match inconnu",
                    p.Score1,
                    p.Score2,
                    realScore1 = p.Match?.Score1,
                    realScore2 = p.Match?.Score2,
                    matchStatus = GetMatchStatus(p.Match),
                    points = CalculatePoints(p) // Points calculés pour ce pronostic
                }).ToList();

                _logger.LogInformation($"Récupéré {result.Count} pronostics pour l'utilisateur {userId}");
                return Ok(result);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, $"Erreur lors de la récupération des pronostics pour l'utilisateur {userId}");
                return StatusCode(500, new { message = "Erreur serveur", error = ex.Message });
            }
        }

        // GET: api/Pronostics/summary - Résumé des points par utilisateur
        [HttpGet("summary")]
        public async Task<ActionResult<IEnumerable<object>>> GetPointsSummary()
        {
            try
            {
                // Récupérer tous les pronostics avec les points calculés
                var pronostics = await _context.Pronostics
                    .Include(p => p.User)
                    .Include(p => p.Match)
                    .Where(p => p.Match != null && p.Match.Score1.HasValue && p.Match.Score2.HasValue) // Seulement les matchs terminés
                    .ToListAsync();

                // Grouper par utilisateur et calculer le total des points
                var summary = pronostics
                    .GroupBy(p => p.UserId)
                    .Select(g => new
                    {
                        UserId = g.Key,
                        TotalPoints = g.Sum(p => CalculatePoints(p)),
                        UserLogin = g.FirstOrDefault()?.User?.Login ?? "Utilisateur inconnu"
                    })
                    .OrderByDescending(s => s.TotalPoints)
                    .ToList();

                _logger.LogInformation($"Récupéré le résumé des points pour {summary.Count} utilisateurs");
                return Ok(summary);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Erreur lors de la récupération du résumé des points");
                return StatusCode(500, new { message = "Erreur serveur", error = ex.Message });
            }
        }

        [HttpPost]
        public async Task<ActionResult<object>> PostPronostic([FromBody] PronosticCreateDto dto)
        {
            if (dto == null || dto.UserId <= 0 || dto.MatchId <= 0)
                return BadRequest(new { message = "Données invalides" });

            var match = await _context.Matches.FindAsync(dto.MatchId);
            if (match == null)
                return BadRequest(new { message = "Match non trouvé" });

            // Vérifier si le pronostic est encore autorisé
            if (!IsPronosticAllowed(match))
                return BadRequest(new { message = $"Les pronostics sont fermés {match.PronosticCloseMinutes} minutes avant le match" });


            if (match.Score1.HasValue && match.Score2.HasValue)
                return BadRequest(new { message = "Match déjà terminé" });

            //  Vérifier si un pronostic existe déjà pour cet utilisateur et ce match
            var existing = await _context.Pronostics
                .FirstOrDefaultAsync(p => p.UserId == dto.UserId && p.MatchId == dto.MatchId);

            if (existing != null)
            {
                // Mise à jour du pronostic existant
                existing.Score1 = dto.Score1;
                existing.Score2 = dto.Score2;

                await _context.SaveChangesAsync();

                return Ok(new
                {
                    message = "Pronostic mis à jour",
                    points = 0 // Pas de points tant que le match n'est pas terminé
                });
            }

            // Création d'un nouveau pronostic
            var newPronostic = new Pronostic
            {
                UserId = dto.UserId,
                MatchId = dto.MatchId,
                Score1 = dto.Score1,
                Score2 = dto.Score2
            };

            _context.Pronostics.Add(newPronostic);
            await _context.SaveChangesAsync();

            return Ok(new
            {
                message = "Pronostic créé",
                points = 0 // Pas de points tant que le match n'est pas terminé
            });
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> PutPronostic(int id, [FromBody] PronosticUpdateDto dto)
        {
            var pronostic = await _context.Pronostics.FindAsync(id);
            if (pronostic == null)
                return NotFound(new { message = "Pronostic non trouvé" });

            var match = await _context.Matches.FindAsync(pronostic.MatchId);
            if (match == null)
                return BadRequest(new { message = "Match non trouvé" });

            if (!IsPronosticAllowed(match))
                return BadRequest(new { message = "Impossible de modifier : pronostics fermés  {match.PronosticCloseMinutes} minutes avant le match" });

            if (match.Score1.HasValue && match.Score2.HasValue)
                return BadRequest(new { message = "Match déjà terminé" });

            if (dto.Score1.HasValue) pronostic.Score1 = dto.Score1;
            if (dto.Score2.HasValue) pronostic.Score2 = dto.Score2;

            await _context.SaveChangesAsync();
            return Ok(new { message = "Pronostic mis à jour" });
        }

        private bool IsPronosticAllowed(Match match)
        {
            if (match == null || !match.MatchDate.HasValue)
                return false;

            var diff = match.MatchDate.Value.ToUniversalTime() - DateTime.UtcNow;
            int closeMinutes = match.PronosticCloseMinutes > 0 ? match.PronosticCloseMinutes : 120;

            _logger.LogInformation(
                "PRONOSTIC CHECK | MatchUTC={Match} | NowUTC={Now} | DiffMinutes={Diff}",
                match.MatchDate.Value.ToUniversalTime(),
                DateTime.UtcNow,
                diff.TotalMinutes
            );

            return diff.TotalMinutes >= closeMinutes;
        }


        private string GetMatchStatus(Match match)
        {
            if (match == null)
                return "inconnu";

            if (match.Score1.HasValue && match.Score2.HasValue)
                return "terminé";

            if (match.MatchDate.HasValue)
            {
                var now = DateTime.UtcNow;
                var matchDateUtc = match.MatchDate.Value.ToUniversalTime();

                if (now >= matchDateUtc)
                    return "en cours";
            }

            return "à venir";
        }

        private int CalculatePoints(Pronostic pronostic)
        {
            if (pronostic.Match == null || !pronostic.Match.Score1.HasValue || !pronostic.Match.Score2.HasValue)
                return 0;

            if (pronostic.Score1 == null || pronostic.Score2 == null)
                return 0;

            int score1 = pronostic.Score1.Value;
            int score2 = pronostic.Score2.Value;
            int realScore1 = pronostic.Match.Score1.Value;
            int realScore2 = pronostic.Match.Score2.Value;

            // Score exact = 3 points
            if (score1 == realScore1 && score2 == realScore2)
            {
                _logger.LogDebug($"Score exact: {score1}-{score2} vs {realScore1}-{realScore2} = 3 points");
                return 3;
            }

            // Calculer les différences
            int predictedDiff = score1 - score2;
            int actualDiff = realScore1 - realScore2;

            int points = 0;

            // Bon résultat (victoire/défaite/nul) = 1 point
            if ((predictedDiff > 0 && actualDiff > 0) ||
                (predictedDiff < 0 && actualDiff < 0) ||
                (predictedDiff == 0 && actualDiff == 0))
            {
                points = 1;
                _logger.LogDebug($"Bon résultat: {score1}-{score2} vs {realScore1}-{realScore2} = 1 point");
            }

            // Bonne différence de buts = 1 point supplémentaire (2 points au total)
            if (predictedDiff == actualDiff && points == 1)
            {
                points = 2;
                _logger.LogDebug($"Bonne différence: {score1}-{score2} vs {realScore1}-{realScore2} = 2 points");
            }

            return points;
        }

        public class PronosticCreateDto
        {
            public int UserId { get; set; }
            public int MatchId { get; set; }
            public int? Score1 { get; set; }
            public int? Score2 { get; set; }
        }

        public class PronosticUpdateDto
        {
            public int? Score1 { get; set; }
            public int? Score2 { get; set; }
        }
    }
}