using System.ComponentModel.DataAnnotations;

namespace backend.Models
{
    public class Pronostic
    {
        public int Id { get; set; }

        public int? UserId { get; set; }
        public int? MatchId { get; set; }

        [Range(0, 20, ErrorMessage = "Le score doit être entre 0 et 20")]
        public int? Score1 { get; set; }

        [Range(0, 20, ErrorMessage = "Le score doit être entre 0 et 20")]
        public int? Score2 { get; set; }

        public User User { get; set; } = null!;
        public Match Match { get; set; } = null!;
    }
}