using backend.Models;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

[Table("Matches")]
public class Match
{
    [Key]
    [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
    public int Id { get; set; }

    [Column("Team1")] 
    public int Team1Id { get; set; }

    [Column("Team2")] 
    public int Team2Id { get; set; }

    [Column("MatchDate")] 
    public DateTime? MatchDate { get; set; }

    [Column("Score1")] 
    public int? Score1 { get; set; }

    [Column("Score2")] 
    public int? Score2 { get; set; }

   
    [ForeignKey("Team1Id")]
    public Team Team1 { get; set; } = null!;

    [ForeignKey("Team2Id")]
    public Team Team2 { get; set; } = null!;
    public int PronosticCloseMinutes { get; set; } = 120; 

    public virtual ICollection<Pronostic> Pronostics { get; set; } = new List<Pronostic>();
}