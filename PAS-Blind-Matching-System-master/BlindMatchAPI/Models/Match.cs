namespace BlindMatchAPI.Models
{
    public class Match
    {
        public int Id { get; set; }
        public int ProjectId { get; set; }
        public Project Project { get; set; } = null!;
        public string SupervisorId { get; set; } = string.Empty;
        public ApplicationUser Supervisor { get; set; } = null!;
        public bool IsRevealed { get; set; } = false;
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    }
}