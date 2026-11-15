using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using backend.Data;
using backend.Models;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace backend.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class MatchesController : ControllerBase
    {
        private readonly AppDbContext _context;

        public MatchesController(AppDbContext context)
        {
            _context = context;
        }

        [HttpGet]
        public async Task<ActionResult<IEnumerable<object>>> GetMatches()
        {
            try
            {
                var matches = await _context.Matches
                    .Include(m => m.Team1)
                    .Include(m => m.Team2)
                    .Select(m => new
                    {
                        m.Id,
                        match = $"{m.Team1.Name} vs {m.Team2.Name}",
                        team1Id = m.Team1Id,
                        team2Id = m.Team2Id,
                        team1Name = m.Team1.Name,
                        team2Name = m.Team2.Name,
                        date = m.MatchDate,
                        score = m.Score1.HasValue && m.Score2.HasValue ? $"{m.Score1} - {m.Score2}" : "0 - 0",
                        score1 = m.Score1,
                        score2 = m.Score2,
                        status = m.Score1.HasValue && m.Score2.HasValue ? "terminé" : "à venir",
                        pronosticCloseMinutes = m.PronosticCloseMinutes
                    })

                    .OrderBy(m => m.date)
                    .ToListAsync();

                return Ok(matches);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = $"Erreur: {ex.Message}" });
            }
        }

        [HttpGet("{id}")]
        public async Task<ActionResult<object>> GetMatch(int id)
        {
            try
            {
                var match = await _context.Matches
                    .Include(m => m.Team1)
                    .Include(m => m.Team2)
                    .Where(m => m.Id == id)
                    .Select(m => new
                    {
                        m.Id,
                        m.Team1Id,
                        m.Team2Id,
                        team1Name = m.Team1.Name,
                        team2Name = m.Team2.Name,
                        m.MatchDate,
                        m.Score1,
                        m.Score2,
                        pronosticCloseMinutes = m.PronosticCloseMinutes
                    })
                    .FirstOrDefaultAsync();

                if (match == null)
                    return NotFound(new { message = "Match non trouvé" });

                return Ok(match);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = $"Erreur: {ex.Message}" });
            }
        }

        [HttpPost]
        public async Task<ActionResult<object>> PostMatch([FromBody] MatchCreateDto matchDto)
        {
            try
            {
                if (matchDto == null)
                    return BadRequest(new { message = "Données match manquantes" });

                // Validation
                if (matchDto.Team1Id <= 0 || matchDto.Team2Id <= 0)
                    return BadRequest(new { message = "Les équipes sont requises" });

                if (matchDto.Team1Id == matchDto.Team2Id)
                    return BadRequest(new { message = "Les deux équipes doivent être différentes" });

                // Vérifier que les équipes existent
                var team1Exists = await _context.Teams.AnyAsync(t => t.Id == matchDto.Team1Id);
                var team2Exists = await _context.Teams.AnyAsync(t => t.Id == matchDto.Team2Id);

                if (!team1Exists || !team2Exists)
                    return BadRequest(new { message = "Une des équipes n'existe pas" });

                // Créer le match
                var match = new Match
                {
                    Team1Id = matchDto.Team1Id,
                    Team2Id = matchDto.Team2Id,
                    MatchDate = matchDto.MatchDate,
                    Score1 = matchDto.Score1,
                    Score2 = matchDto.Score2,
                        PronosticCloseMinutes = matchDto.PronosticCloseMinutes // <-- ajouté

                };

                _context.Matches.Add(match);
                await _context.SaveChangesAsync();

                var createdMatch = await _context.Matches
                    .Include(m => m.Team1)
                    .Include(m => m.Team2)
                    .Where(m => m.Id == match.Id)
                    .Select(m => new
                    {
                        m.Id,
                        match = $"{m.Team1.Name} vs {m.Team2.Name}",
                        team1Name = m.Team1.Name,
                        team2Name = m.Team2.Name,
                        date = m.MatchDate,
                        score = m.Score1.HasValue && m.Score2.HasValue ? $"{m.Score1} - {m.Score2}" : "0 - 0",
                        status = m.Score1.HasValue && m.Score2.HasValue ? "terminé" : "à venir",
                        pronosticCloseMinutes = m.PronosticCloseMinutes

                    })
                    .FirstOrDefaultAsync();

                return Ok(createdMatch);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = $"Erreur: {ex.Message}" });
            }
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> PutMatch(int id, [FromBody] MatchUpdateDto matchDto)
        {
            try
            {
                var match = await _context.Matches.FindAsync(id);
                if (match == null)
                    return NotFound(new { message = "Match non trouvé" });

                if (matchDto.Team1Id.HasValue) match.Team1Id = matchDto.Team1Id.Value;
                if (matchDto.Team2Id.HasValue) match.Team2Id = matchDto.Team2Id.Value;
                if (matchDto.MatchDate.HasValue) match.MatchDate = matchDto.MatchDate.Value;
                if (matchDto.Score1.HasValue) match.Score1 = matchDto.Score1.Value;
                if (matchDto.Score2.HasValue) match.Score2 = matchDto.Score2.Value;
                if (matchDto.PronosticCloseMinutes > 0)
                    match.PronosticCloseMinutes = matchDto.PronosticCloseMinutes;

                await _context.SaveChangesAsync();

                return Ok(new { message = "Match mis à jour" });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = $"Erreur: {ex.Message}" });
            }
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteMatch(int id)
        {
            try
            {
                var match = await _context.Matches.FindAsync(id);
                if (match == null)
                    return NotFound(new { message = "Match non trouvé" });

                var pronostics = await _context.Pronostics
                    .Where(p => p.MatchId == id)
                    .ToListAsync();

                if (pronostics.Any())
                {
                    _context.Pronostics.RemoveRange(pronostics);
                    await _context.SaveChangesAsync();
                    Console.WriteLine($"Supprimé {pronostics.Count} pronostics pour le match {id}");
                }

                _context.Matches.Remove(match);
                await _context.SaveChangesAsync();

                return Ok(new
                {
                    message = "Match supprimé avec succès",
                    pronosticsSupprimes = pronostics.Count
                });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new
                {
                    message = "Erreur lors de la suppression",
                    details = ex.InnerException?.Message ?? ex.Message
                });
            }
        }

        [HttpPut("{id}/score")]
        public async Task<IActionResult> UpdateScore(int id, [FromBody] ScoreUpdateDto scoreDto)
        {
            try
            {
                var match = await _context.Matches.FindAsync(id);
                if (match == null)
                    return NotFound(new { message = "Match non trouvé" });

                match.Score1 = scoreDto.Score1;
                match.Score2 = scoreDto.Score2;

                await _context.SaveChangesAsync();

                return Ok(new
                {
                    message = "Score mis à jour",
                    score = $"{scoreDto.Score1} - {scoreDto.Score2}"
                });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = $"Erreur: {ex.Message}" });
            }
        }
    }

    public class MatchCreateDto
    {
        public int Team1Id { get; set; }
        public int Team2Id { get; set; }
        public DateTime? MatchDate { get; set; }
        public int? Score1 { get; set; }
        public int? Score2 { get; set; }
        public int PronosticCloseMinutes { get; set; }  // <-- ajout

    }

    public class MatchUpdateDto
    {
        public int? Team1Id { get; set; }
        public int? Team2Id { get; set; }
        public DateTime? MatchDate { get; set; }
        public int? Score1 { get; set; }
        public int? Score2 { get; set; }
        public int PronosticCloseMinutes { get; set; }  // <-- ajout

    }

    public class ScoreUpdateDto
    {
        public int Score1 { get; set; }
        public int Score2 { get; set; }

    }
}