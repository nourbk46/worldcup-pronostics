using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace backend.Models
{
    [Table("Teams")]
    public class Team
    {
        [Key]
        [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        public int Id { get; set; }

        [Required]
        [MaxLength(100)]
        public string? Name { get; set; }      
        public string? FlagPath { get; set; } 


        [InverseProperty("Team1")]
        public ICollection<Match> MatchesAsTeam1 { get; set; } = new List<Match>();

        [InverseProperty("Team2")]
        public ICollection<Match> MatchesAsTeam2 { get; set; } = new List<Match>();
    }
}