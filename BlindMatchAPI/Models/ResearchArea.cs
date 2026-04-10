namespace BlindMatchAPI.Models
{
    public class ResearchArea
    {
        public int Id { get; set; }
        public string Name { get; set; } = string.Empty;
        public ICollection<Project> Projects { get; set; } = new List<Project>();
        public ICollection<SupervisorPreference> SupervisorPreferences { get; set; } = new List<SupervisorPreference>();
    }
}