using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using backend.Data;
using backend.Models;
using System.Threading.Tasks;

namespace backend.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class AuthController : ControllerBase
    {
        private readonly AppDbContext _context;

        public AuthController(AppDbContext context)
        {
            _context = context;
        }

        [HttpPost("login")]
        public async Task<ActionResult<object>> Login([FromBody] LoginRequest request)
        {
            try
            {
                
                if (string.IsNullOrWhiteSpace(request.Login))
                    return BadRequest(new { message = "Le login est requis" });

                if (string.IsNullOrWhiteSpace(request.Password))
                    return BadRequest(new { message = "Le mot de passe est requis" });

               
                var user = await _context.Users
                    .FirstOrDefaultAsync(u => u.Login == request.Login);

                if (user == null)
                    return Unauthorized(new { message = "Login ou mot de passe incorrect" });

    
                if (user.Password != request.Password)
                    return Unauthorized(new { message = "Login ou mot de passe incorrect" });

               
                return Ok(new
                {
                    user.Id,
                    user.Login,
                    user.Score,
                    Role = user.Role ?? "user", // Valeur par défaut si null
                    Token = $"token-{user.Id}-{System.DateTime.Now.Ticks}"
                });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = $"Erreur interne: {ex.Message}" });
            }
        }
    }

    public class LoginRequest
    {
        public string Login { get; set; } = string.Empty;
        public string Password { get; set; } = string.Empty;
    }
}