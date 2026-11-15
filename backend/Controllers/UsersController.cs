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
    public class UsersController : ControllerBase
    {
        private readonly AppDbContext _context;

        public UsersController(AppDbContext context)
        {
            _context = context;
        }

        [HttpGet]
        public async Task<ActionResult<IEnumerable<object>>> GetUsers()
        {
            var users = await _context.Users
                .Select(u => new
                {
                    u.Id,
                    u.Login,
                    u.Score,
                    u.Role
                })
                .ToListAsync();

            return Ok(users);
        }


        [HttpGet("{id}")]
        public async Task<ActionResult<object>> GetUser(int id)
        {
            try
            {
                var user = await _context.Users
                    .Where(u => u.Id == id)
                    .Select(u => new
                    {
                        u.Id,
                        u.Login,
                        u.Password,
                        u.Score,
                        u.Role
                    })
                    .FirstOrDefaultAsync();

                if (user == null)
                    return NotFound(new { message = $"Utilisateur {id} non trouvé" });

                return Ok(user);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = $"Erreur: {ex.Message}" });
            }
        }

        [HttpPost]
        public async Task<ActionResult<object>> PostUser([FromBody] User user)
        {
            try
            {
                if (user == null)
                    return BadRequest(new { message = "Données utilisateur manquantes" });

                if (string.IsNullOrWhiteSpace(user.Login))
                    return BadRequest(new { message = "Le login est requis" });

                if (string.IsNullOrWhiteSpace(user.Password))
                    return BadRequest(new { message = "Le mot de passe est requis" });

                var exists = await _context.Users.AnyAsync(u => u.Login == user.Login);
                if (exists)
                    return BadRequest(new { message = "Ce login est déjà utilisé" });

                if (user.Score < 0) user.Score = 0;
                if (string.IsNullOrWhiteSpace(user.Role)) user.Role = "user";

                _context.Users.Add(user);
                await _context.SaveChangesAsync();

                return Ok(new
                {
                    user.Id,
                    user.Login,
                    user.Password,
                    user.Score,
                    user.Role
                });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = $"Erreur: {ex.Message}" });
            }
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> PutUser(int id, [FromBody] User user)
        {
            try
            {
                if (id != user.Id)
                    return BadRequest(new { message = "ID incompatible" });

                var existingUser = await _context.Users.FindAsync(id);
                if (existingUser == null)
                    return NotFound(new { message = "Utilisateur non trouvé" });

                if (user.Login != existingUser.Login)
                {
                    var loginExists = await _context.Users
                        .AnyAsync(u => u.Login == user.Login && u.Id != id);
                    if (loginExists)
                        return BadRequest(new { message = "Login déjà utilisé" });
                }

                existingUser.Login = user.Login;
                existingUser.Password = user.Password;
                existingUser.Score = user.Score;
                existingUser.Role = user.Role;

                await _context.SaveChangesAsync();

                return Ok(new
                {
                    existingUser.Id,
                    existingUser.Login,
                    existingUser.Password,
                    existingUser.Score,
                    existingUser.Role
                });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = $"Erreur: {ex.Message}" });
            }
        }
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteUser(int id)
        {
            try
            {
                Console.WriteLine($"Tentative de suppression de l'utilisateur {id}");

                var user = await _context.Users.FindAsync(id);
                if (user == null)
                {
                    Console.WriteLine($"Utilisateur {id} non trouvé");
                    return NotFound(new { message = $"Utilisateur {id} non trouvé" });
                }

                Console.WriteLine($"Utilisateur trouvé: {user.Login} (ID: {user.Id})");

                if (user.Role == "admin")
                {
                    var adminCount = await _context.Users.CountAsync(u => u.Role == "admin");
                    if (adminCount <= 1)
                    {
                        return BadRequest(new { message = "Impossible de supprimer le dernier administrateur" });
                    }
                }

                _context.Users.Remove(user);
                await _context.SaveChangesAsync();

                Console.WriteLine($"Utilisateur {id} supprimé avec succès");
                return NoContent(); 
            }
            catch (DbUpdateException dbEx)
            {
                Console.WriteLine($"Erreur DB: {dbEx.Message}");
                if (dbEx.InnerException != null)
                {
                    Console.WriteLine($"Inner: {dbEx.InnerException.Message}");
                }

                return BadRequest(new
                {
                    message = "Impossible de supprimer cet utilisateur car il a des données associées",
                    details = "Supprimez d'abord ses pronostics ou équipes"
                });
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Erreur générale: {ex.Message}");
                Console.WriteLine($"StackTrace: {ex.StackTrace}");

                return StatusCode(500, new
                {
                    message = "Erreur interne du serveur",
                    error = ex.Message
                });
            }
        }
        [HttpGet("with-points")]
        public async Task<ActionResult<IEnumerable<object>>> GetUsersWithPoints()
        {
            var users = await _context.Users
                .Include(u => u.Pronostics)
                    .ThenInclude(p => p.Match)
                .ToListAsync();

            var result = users.Select(u => new
            {
                u.Id,
                u.Login,
                u.Role,
                points = u.Pronostics
                    .Where(p => p.Match != null
                        && p.Match.Score1.HasValue
                        && p.Match.Score2.HasValue)
                    .Sum(p => CalculatePoints(p))
            }).ToList();

            return Ok(result);
        }


        private int CalculatePoints(Pronostic pronostic)
        {
            if (pronostic.Match == null)
                return 0;

            if (!pronostic.Score1.HasValue || !pronostic.Score2.HasValue)
                return 0;

            if (!pronostic.Match.Score1.HasValue || !pronostic.Match.Score2.HasValue)
                return 0;

            int score1 = pronostic.Score1.Value;
            int score2 = pronostic.Score2.Value;
            int real1 = pronostic.Match.Score1.Value;
            int real2 = pronostic.Match.Score2.Value;

           
            if (score1 == real1 && score2 == real2)
                return 3;

            int predictedDiff = score1 - score2;
            int actualDiff = real1 - real2;

       
            if (predictedDiff == actualDiff)
                return 2;

            if ((predictedDiff > 0 && actualDiff > 0) ||
                (predictedDiff < 0 && actualDiff < 0) ||
                (predictedDiff == 0 && actualDiff == 0))
                return 1;

            return 0;
        }



    }
}