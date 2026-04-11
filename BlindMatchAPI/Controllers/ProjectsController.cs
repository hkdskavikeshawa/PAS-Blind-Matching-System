using BlindMatchAPI.Data;
using BlindMatchAPI.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Security.Claims;

namespace BlindMatchAPI.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class ProjectsController : ControllerBase
    {
        private readonly AppDbContext _context;

        public ProjectsController(AppDbContext context)
        {
            _context = context;
        }

        // GET: api/projects - Supervisor blind view (no student info)
        [HttpGet]
        [Authorize(Roles = "Supervisor,ModuleLeader")]
        public async Task<IActionResult> GetAll()
        {
            var projects = await _context.Projects
                .Include(p => p.ResearchArea)
                .Where(p => p.Status == "Pending" || p.Status == "Under Review")
                .Select(p => new
                {
                    p.Id,
                    p.Title,
                    p.Abstract,
                    p.TechStack,
                    p.Status,
                    ResearchArea = p.ResearchArea.Name
                    // StudentId is NOT included - this is the blind part!
                })
                .ToListAsync();

            return Ok(projects);
        }

        // GET: api/projects/my - Student sees their own projects
        [HttpGet("my")]
        [Authorize(Roles = "Student")]
        public async Task<IActionResult> GetMyProjects()
        {
            var studentId = User.FindFirstValue(ClaimTypes.NameIdentifier);

            var projects = await _context.Projects
                .Include(p => p.ResearchArea)
                .Include(p => p.Match)
                    .ThenInclude(m => m!.Supervisor)
                .Where(p => p.StudentId == studentId)
                .Select(p => new
                {
                    p.Id,
                    p.Title,
                    p.Abstract,
                    p.TechStack,
                    p.Status,
                    ResearchArea = p.ResearchArea.Name,
                    // Only show supervisor if revealed
                    SupervisorName = p.Match != null && p.Match.IsRevealed
                        ? p.Match.Supervisor.FullName : null,
                    SupervisorEmail = p.Match != null && p.Match.IsRevealed
                        ? p.Match.Supervisor.Email : null
                })
                .ToListAsync();

            return Ok(projects);
        }

        // POST: api/projects - Student submits project
        [HttpPost]
        [Authorize(Roles = "Student")]
        public async Task<IActionResult> Create([FromBody] Project project)
        {
            var studentId = User.FindFirstValue(ClaimTypes.NameIdentifier);

            var areaExists = await _context.ResearchAreas
                .AnyAsync(r => r.Id == project.ResearchAreaId);
            if (!areaExists)
                return BadRequest("Invalid research area.");

            project.StudentId = studentId!;
            project.Status = "Pending";

            _context.Projects.Add(project);
            await _context.SaveChangesAsync();
            return Ok(project);
        }

        // PUT: api/projects/1 - Student edits their project
        [HttpPut("{id}")]
        [Authorize(Roles = "Student")]
        public async Task<IActionResult> Update(int id, [FromBody] Project updated)
        {
            var studentId = User.FindFirstValue(ClaimTypes.NameIdentifier);
            var project = await _context.Projects
                .FirstOrDefaultAsync(p => p.Id == id && p.StudentId == studentId);

            if (project == null)
                return NotFound("Project not found or not yours.");

            if (project.Status == "Matched")
                return BadRequest("Cannot edit a matched project.");

            project.Title = updated.Title;
            project.Abstract = updated.Abstract;
            project.TechStack = updated.TechStack;
            project.ResearchAreaId = updated.ResearchAreaId;

            await _context.SaveChangesAsync();
            return Ok(project);
        }

        // DELETE: api/projects/1 - Student withdraws project
        [HttpDelete("{id}")]
        [Authorize(Roles = "Student")]
        public async Task<IActionResult> Delete(int id)
        {
            var studentId = User.FindFirstValue(ClaimTypes.NameIdentifier);
            var project = await _context.Projects
                .FirstOrDefaultAsync(p => p.Id == id && p.StudentId == studentId);

            if (project == null)
                return NotFound("Project not found or not yours.");

            if (project.Status == "Matched")
                return BadRequest("Cannot withdraw a matched project.");

            _context.Projects.Remove(project);
            await _context.SaveChangesAsync();
            return Ok("Project withdrawn.");
        }
    }
}