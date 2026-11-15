using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;

namespace backend.Models
{
    public class User
    {
        public int Id { get; set; }

        [Required(ErrorMessage = "Le login est requis")]
        public string? Login { get; set; }

        [Required(ErrorMessage = "Le mot de passe est requis")]
        public string? Password { get; set; }

        public int Score { get; set; } = 0;

        public string Role { get; set; } = "user";

        public ICollection<Pronostic> Pronostics { get; set; } = new List<Pronostic>();
    }
}