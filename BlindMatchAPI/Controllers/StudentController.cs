using BlindMatchAPI.Data;
using BlindMatchAPI.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;

namespace BlindMatchAPI.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class StudentController : ControllerBase
    {
        private readonly AppDbContext _context;
        private readonly IConfiguration _configuration;

        public StudentController(AppDbContext context, IConfiguration configuration)
        {
            _context = context;
            _configuration = configuration;
        }

        // Helper: Extract student ID from JWT token
        private string? GetStudentId()
        {
            var authHeader = Request.Headers["Authorization"].ToString();
            if (string.IsNullOrEmpty(authHeader) || !authHeader.StartsWith("Bearer "))
                return null;

            var token = authHeader.Substring(7);
            var principal = ValidateToken(token);
            return principal?.FindFirstValue(ClaimTypes.NameIdentifier);
        }

        private ClaimsPrincipal? ValidateToken(string token)
        {
            try
            {
                var key = new SymmetricSecurityKey(
                    Encoding.UTF8.GetBytes(_configuration["Jwt:Key"]!));

                var handler = new JwtSecurityTokenHandler();
                var parameters = new TokenValidationParameters
                {
                    ValidateIssuerSigningKey = true,
                    IssuerSigningKey = key,
                    ValidateIssuer = false,
                    ValidateAudience = false,
                    ValidateLifetime = true,
                    ClockSkew = TimeSpan.Zero
                };

                return handler.ValidateToken(token, parameters, out _);
            }
            catch
            {
                return null;
            }
        }

        // POST: api/student/projects - Create/Submit New Project Proposal
        [HttpPost("projects")]
        public async Task<IActionResult> CreateProject([FromBody] CreateProjectRequest request)
        {
            var studentId = GetStudentId();
            if (studentId == null)
                return Unauthorized("Invalid token.");

            // Validate research area exists
            var areaExists = await _context.ResearchAreas
                .AnyAsync(r => r.Id == request.ResearchAreaId);
            if (!areaExists)
                return BadRequest("Invalid research area.");

            var project = new Project
            {
                Title = request.Title,
                Abstract = request.Abstract,
                TechStack = request.TechStack,
                ResearchAreaId = request.ResearchAreaId,
                StudentId = studentId,
                Status = "Pending"
            };

            _context.Projects.Add(project);
            await _context.SaveChangesAsync();

            return Ok(new
            {
                message = "Project proposal submitted successfully!",
                projectId = project.Id
            });
        }

        // GET: api/student/my-projects - View All My Projects
        [HttpGet("my-projects")]
        public async Task<IActionResult> GetMyProjects()
        {
            var studentId = GetStudentId();
            if (studentId == null)
                return Unauthorized("Invalid token.");

            var projects = await _context.Projects
                .Where(p => p.StudentId == studentId)
                .Include(p => p.ResearchArea)
                .Include(p => p.Match)
                .ThenInclude(m => m.Supervisor)
                .Select(p => new
                {
                    p.Id,
                    p.Title,
                    p.Abstract,
                    p.TechStack,
                    p.Status,
                    ResearchArea = p.ResearchArea.Name,
                    IsMatched = p.Match != null,
                    SupervisorName = p.Match != null && p.Match.IsRevealed 
                        ? p.Match.Supervisor.FullName 
                        : null,
                    SupervisorEmail = p.Match != null && p.Match.IsRevealed 
                        ? p.Match.Supervisor.Email 
                        : null
                })
                .ToListAsync();

            return Ok(projects);
        }

        // GET: api/student/projects/{id} - View Single Project with Details
        [HttpGet("projects/{id}")]
        public async Task<IActionResult> GetProjectById(int id)
        {
            var studentId = GetStudentId();
            if (studentId == null)
                return Unauthorized("Invalid token.");

            var project = await _context.Projects
                .Where(p => p.Id == id && p.StudentId == studentId)
                .Include(p => p.ResearchArea)
                .Include(p => p.Match)
                .ThenInclude(m => m.Supervisor)
                .FirstOrDefaultAsync();

            if (project == null)
                return NotFound("Project not found or you don't have access.");

            var response = new
            {
                project.Id,
                project.Title,
                project.Abstract,
                project.TechStack,
                project.Status,
                ResearchArea = project.ResearchArea.Name,
                IsMatched = project.Match != null,
                IsRevealed = project.Match?.IsRevealed ?? false,
                Supervisor = project.Match != null && project.Match.IsRevealed
                    ? new
                    {
                        Name = project.Match.Supervisor.FullName,
                        Email = project.Match.Supervisor.Email,
                        Phone = project.Match.Supervisor.PhoneNumber
                    }
                    : null
            };

            return Ok(response);
        }

        // PUT: api/student/projects/{id} - Edit Project (only if Pending)
        [HttpPost("projects/{id}")]
        public async Task<IActionResult> UpdateProject(int id, [FromBody] UpdateProjectRequest request)
        {
            var studentId = GetStudentId();
            if (studentId == null)
                return Unauthorized("Invalid token.");

            var project = await _context.Projects
                .FirstOrDefaultAsync(p => p.Id == id && p.StudentId == studentId);

            if (project == null)
                return NotFound("Project not found or you don't have access.");

            if (project.Status != "Pending")
                return BadRequest("Cannot edit project. It's already under review or matched.");

            // Update fields
            project.Title = request.Title;
            project.Abstract = request.Abstract;
            project.TechStack = request.TechStack;
            project.ResearchAreaId = request.ResearchAreaId;

            await _context.SaveChangesAsync();

            return Ok(new { message = "Project updated successfully!" });
        }

        // DELETE: api/student/projects/{id} - Withdraw Project
        [HttpDelete("projects/{id}")]
        public async Task<IActionResult> DeleteProject(int id)
        {
            var studentId = GetStudentId();
            if (studentId == null)
                return Unauthorized("Invalid token.");

            var project = await _context.Projects
                .Include(p => p.Match)
                .FirstOrDefaultAsync(p => p.Id == id && p.StudentId == studentId);

            if (project == null)
                return NotFound("Project not found or you don't have access.");

            if (project.Status == "Matched")
                return BadRequest("Cannot delete a matched project.");

            // Delete match if exists
            if (project.Match != null)
            {
                _context.Matches.Remove(project.Match);
            }

            _context.Projects.Remove(project);
            await _context.SaveChangesAsync();

            return Ok(new { message = "Project withdrawn successfully!" });
        }

        // GET: api/student/projects/{id}/status - View Project Status & Match Info
        [HttpGet("projects/{id}/status")]
        public async Task<IActionResult> GetProjectStatus(int id)
        {
            var studentId = GetStudentId();
            if (studentId == null)
                return Unauthorized("Invalid token.");

            var project = await _context.Projects
                .Where(p => p.Id == id && p.StudentId == studentId)
                .Include(p => p.Match)
                .ThenInclude(m => m.Supervisor)
                .FirstOrDefaultAsync();

            if (project == null)
                return NotFound("Project not found.");

            var response = new
            {
                project.Status,
                IsMatched = project.Match != null,
                IsRevealed = project.Match?.IsRevealed ?? false,
                SupervisorInfo = project.Match != null && project.Match.IsRevealed
                    ? new
                    {
                        Name = project.Match.Supervisor.FullName,
                        Email = project.Match.Supervisor.Email,
                        Message = "Your supervisor has been assigned! You can now contact them."
                    }
                    : null
            };

            return Ok(response);
        }
    }

    // DTOs
    public class CreateProjectRequest
    {
        public string Title { get; set; } = string.Empty;
        public string Abstract { get; set; } = string.Empty;
        public string TechStack { get; set; } = string.Empty;
        public int ResearchAreaId { get; set; }
    }

    public class UpdateProjectRequest
    {
        public string Title { get; set; } = string.Empty;
        public string Abstract { get; set; } = string.Empty;
        public string TechStack { get; set; } = string.Empty;
        public int ResearchAreaId { get; set; }
    }
}
