using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using BlindMatchAPI.Data;
using BlindMatchAPI.Models;

namespace BlindMatchAPI.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class ProjectController : ControllerBase
    {
        private readonly AppDbContext _context;

        public ProjectController(AppDbContext context)
        {
            _context = context;
        }

        [HttpGet]
        public async Task<IActionResult> GetProjects()
        {
            var projects = await (from p in _context.Projects
                                  join ra in _context.ResearchAreas on p.ResearchAreaId equals ra.Id
                                  join u in _context.Users on p.StudentId equals u.Id
                                  
                                  join m in _context.Matches on p.Id equals m.ProjectId into pm
                                  from match in pm.DefaultIfEmpty()
                                  join sup in _context.Users on match.SupervisorId equals sup.Id into supm
                                  from supervisor in supm.DefaultIfEmpty()
                                  select new
                                  {
                                      id = p.Id,
                                      code = "PAS-2026-" + p.Id.ToString("D3"),
                                      title = p.Title,
                                      studentName = u.FullName, 
                                      area = ra.Name,
                                      status = p.Status,
                                      
                                      supervisor = supervisor != null ? supervisor.FullName : "—"
                                  }).ToListAsync();

            return Ok(projects);
        }
        [HttpGet("suitable-supervisors-by-name")]
        public async Task<IActionResult> GetSuitableSupervisorsByName(string areaName)
        {
            var supervisors = await _context.SupervisorPreferences
                .Include(sp => sp.ResearchArea)
                .Where(sp => sp.ResearchArea.Name == areaName)
                .Join(_context.Users,
                    pref => pref.SupervisorId,
                    user => user.Id,
                    (pref, user) => new {
                        id = user.Id,
                        name = user.UserName 
                    })
                .ToListAsync();

            return Ok(supervisors);
        }

        [HttpPut("reassign")]
        public async Task<IActionResult> ReassignSupervisor([FromBody] ReassignRequest request)
        {
            
            var existingMatch = await _context.Matches
                .FirstOrDefaultAsync(m => m.ProjectId == request.ProjectId);

            if (existingMatch == null)
            {
                return NotFound("Match record not found for this project.");
            }

            
            existingMatch.SupervisorId = request.SupervisorId;
            existingMatch.CreatedAt = DateTime.Now; 

            await _context.SaveChangesAsync();

            return Ok(new { message = "Supervisor reassigned successfully!" });
        }

        
        public class ReassignRequest
        {
            public int ProjectId { get; set; }
            public string SupervisorId { get; set; }
        }
    }
}