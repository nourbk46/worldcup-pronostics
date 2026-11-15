using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using backend.Data;
using backend.Models;
using System.Text.Json;
using System;
using System.IO;
using System.Linq;
using System.Threading.Tasks;

namespace backend.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class TeamsController : ControllerBase
    {
        private readonly AppDbContext _context;
        private readonly IWebHostEnvironment _env;

        public TeamsController(AppDbContext context, IWebHostEnvironment env)
        {
            _context = context;
            _env = env;
        }
        [HttpGet]
        public async Task<ActionResult<IEnumerable<object>>> GetTeams()
        {
            try
            {
                var teams = await _context.Teams
                    .AsNoTracking()
                    .Select(t => new {
                        t.Id,
                        Name = t.Name ?? "Nom inconnu",          // si Name est NULL
                        FlagPath = t.FlagPath ?? string.Empty    // si FlagPath est NULL
                    })
                    .OrderBy(t => t.Name)
                    .ToListAsync();

                return Ok(teams);
            }
            catch (Exception ex)
            {
                Console.WriteLine($"❌ Erreur GetTeams: {ex.Message}");
                Console.WriteLine(ex.StackTrace);
                return StatusCode(500, new { message = "Erreur serveur lors de la récupération des équipes" });
            }
        }




        [HttpPost]
        public async Task<ActionResult<object>> PostTeam([FromBody] Team team)
        {
            if (team == null || string.IsNullOrWhiteSpace(team.Name))
                return BadRequest(new { message = "Le nom de l'équipe est requis" });

            var exists = await _context.Teams.AnyAsync(t => t.Name == team.Name);
            if (exists)
                return BadRequest(new { message = "Cette équipe existe déjà" });

            team.Name = team.Name.Trim();
            _context.Teams.Add(team);
            await _context.SaveChangesAsync();

            return Ok(new
            {
                team.Id,
                team.Name,
                team.FlagPath
            });
        }

        [HttpPut("{id}")]
        public async Task<ActionResult<object>> UpdateTeam(int id, [FromBody] Team updatedTeam)
        {
            Console.WriteLine($"=== UPDATE TEAM REQUEST ===");
            Console.WriteLine($"ID: {id}");
            Console.WriteLine($"Request Body: {JsonSerializer.Serialize(updatedTeam)}");

            if (updatedTeam == null)
            {
                Console.WriteLine("ERROR: updatedTeam is null");
                return BadRequest(new { message = "Données invalides" });
            }

            if (string.IsNullOrWhiteSpace(updatedTeam.Name))
            {
                Console.WriteLine("ERROR: Name is empty");
                return BadRequest(new { message = "Le nom de l'équipe est requis" });
            }

            var team = await _context.Teams.FindAsync(id);
            if (team == null)
            {
                Console.WriteLine($"ERROR: Team with ID {id} not found");
                return NotFound(new { message = $"Équipe avec ID {id} non trouvée" });
            }

            Console.WriteLine($"Found team: {team.Name} (ID: {team.Id})");

            // Vérifier qu'aucune autre équipe n'a le même nom
            var exists = await _context.Teams
                .AnyAsync(t => t.Name == updatedTeam.Name && t.Id != id);

            Console.WriteLine($"Team name '{updatedTeam.Name}' already exists (excluding self): {exists}");

            if (exists)
            {
                return BadRequest(new { message = "Une autre équipe porte déjà ce nom" });
            }

            Console.WriteLine($"Updating team name from '{team.Name}' to '{updatedTeam.Name}'");

            team.Name = updatedTeam.Name.Trim();

            try
            {
                var changes = await _context.SaveChangesAsync();
                Console.WriteLine($"Database updated successfully. Changes: {changes}");

                // Récupérer l'équipe mise à jour pour la réponse
                var updated = await _context.Teams
                    .Where(t => t.Id == id)
                    .Select(t => new { t.Id, t.Name })
                    .FirstOrDefaultAsync();

                Console.WriteLine($"Updated team: {JsonSerializer.Serialize(updated)}");

                return Ok(new
                {
                    message = "Équipe modifiée avec succès",
                    updated.Id,
                    updated.Name
                });
            }
            catch (Exception ex)
            {
                Console.WriteLine($"ERROR saving changes: {ex.Message}");
                Console.WriteLine($"Stack trace: {ex.StackTrace}");
                return StatusCode(500, new { message = "Erreur serveur lors de la mise à jour" });
            }
        }
        [HttpDelete("{id}")]
        public async Task<ActionResult<object>> DeleteTeam(int id)
        {
            var team = await _context.Teams.FindAsync(id);
            if (team == null)
                return NotFound(new { message = "Équipe non trouvée" });

            var isUsedInMatches = await _context.Matches.AnyAsync(m => m.Team1Id == id || m.Team2Id == id);
            if (isUsedInMatches)
                return BadRequest(new { message = "Impossible de supprimer cette équipe, elle est utilisée dans des matchs" });

            // Supprimer le fichier drapeau s'il existe
            if (!string.IsNullOrEmpty(team.FlagPath))
            {
                var filePath = Path.Combine(_env.WebRootPath, "flags", team.FlagPath);
                if (System.IO.File.Exists(filePath))
                    System.IO.File.Delete(filePath);
            }

            _context.Teams.Remove(team);
            await _context.SaveChangesAsync();

            return Ok(new
            {
                message = $"Équipe '{team.Name}' supprimée",
                team.Id,
                team.Name
            });
        }

        // NOUVEL ENDPOINT pour uploader les drapeaux
        [HttpPost("{id}/flag")]
        public async Task<ActionResult<object>> UploadFlag(int id)
        {
            try
            {
                var team = await _context.Teams.FindAsync(id);
                if (team == null)
                    return NotFound(new { message = "Équipe non trouvée" });

                var file = Request.Form.Files["flag"];
                if (file == null || file.Length == 0)
                    return BadRequest(new { message = "Aucun fichier n'a été fourni" });

                // Vérifier la taille du fichier (max 2MB)
                if (file.Length > 2 * 1024 * 1024)
                    return BadRequest(new { message = "Le fichier est trop volumineux (max 2MB)" });

                // Vérifier le type de fichier
                var allowedExtensions = new[] { ".jpg", ".jpeg", ".png", ".gif", ".svg" };
                var extension = Path.GetExtension(file.FileName).ToLowerInvariant();
                if (!allowedExtensions.Contains(extension))
                    return BadRequest(new { message = "Type de fichier non autorisé" });

                // Supprimer l'ancien fichier s'il existe
                if (!string.IsNullOrEmpty(team.FlagPath))
                {
                    var oldFilePath = Path.Combine(_env.WebRootPath, "flags", team.FlagPath);
                    if (System.IO.File.Exists(oldFilePath))
                        System.IO.File.Delete(oldFilePath);
                }

                // Créer le dossier s'il n'existe pas
                var uploadsFolder = Path.Combine(_env.WebRootPath, "flags");
                if (!Directory.Exists(uploadsFolder))
                    Directory.CreateDirectory(uploadsFolder);

                // Générer un nom de fichier unique
                var uniqueFileName = $"{Guid.NewGuid()}{extension}";
                var filePath = Path.Combine(uploadsFolder, uniqueFileName);

                // Sauvegarder le fichier
                using (var stream = new FileStream(filePath, FileMode.Create))
                {
                    await file.CopyToAsync(stream);
                }

                // Mettre à jour le chemin dans la base de données
                team.FlagPath = uniqueFileName;
                await _context.SaveChangesAsync();

                return Ok(new
                {
                    message = "Drapeau uploadé avec succès",
                    flagPath = uniqueFileName,
                    flagUrl = $"{Request.Scheme}://{Request.Host}/flags/{uniqueFileName}"
                });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Erreur lors de l'upload: " + ex.Message });
            }
        }
    }
}