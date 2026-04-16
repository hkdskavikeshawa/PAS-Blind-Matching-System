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
    public class SupervisorController : ControllerBase
    {
        private readonly AppDbContext _context;
        private readonly IConfiguration _configuration;

        public SupervisorController(AppDbContext context, IConfiguration configuration)
        {
            _context = context;
            _configuration = configuration;
        }

        //Manual token validation helper
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

        //Helper: Extract supervisor ID from Authorization header
        private string? GetSupervisorId()
        {
            var authHeader = Request.Headers["Authorization"].ToString();
            if (string.IsNullOrEmpty(authHeader) || !authHeader.StartsWith("Bearer "))
                return null;

            var token = authHeader.Substring(7);
            var principal = ValidateToken(token);
            return principal?.FindFirstValue(ClaimTypes.NameIdentifier);
        }

        //GET: api/supervisor/research-areas
        [HttpGet("research-areas")]
        public async Task<IActionResult> GetAllResearchAreas()
        {
            var supervisorId = GetSupervisorId();
            if (supervisorId == null)
                return Unauthorized("Invalid token.");

            var areas = await _context.ResearchAreas
                .Select(r => new { r.Id, r.Name })
                .ToListAsync();
            return Ok(areas);
        }

        //GET: api/supervisor/preferences
        [HttpGet("preferences")]
        public async Task<IActionResult> GetMyPreferences()
        {
            var supervisorId = GetSupervisorId();
            if (supervisorId == null)
                return Unauthorized("Invalid token.");

            var preferences = await _context.SupervisorPreferences
                .Where(sp => sp.SupervisorId == supervisorId)
                .Select(sp => new
                {
                    sp.Id,
                    sp.ResearchAreaId,
                    ResearchAreaName = sp.ResearchArea.Name
                })
                .ToListAsync();
            return Ok(preferences);
        }

        //POST: api/supervisor/preferences/{researchAreaId}
        [HttpPost("preferences/{researchAreaId}")]
        public async Task<IActionResult> AddPreference(int researchAreaId)
        {
            var supervisorId = GetSupervisorId();
            if (supervisorId == null)
                return Unauthorized("Invalid token.");

            var areaExists = await _context.ResearchAreas
                .AnyAsync(r => r.Id == researchAreaId);
            if (!areaExists)
                return NotFound("Research area not found.");

            var alreadyExists = await _context.SupervisorPreferences
                .AnyAsync(sp => sp.SupervisorId == supervisorId
                             && sp.ResearchAreaId == researchAreaId);
            if (alreadyExists)
                return BadRequest("You already selected this research area.");

            var preference = new SupervisorPreference
            {
                SupervisorId = supervisorId,
                ResearchAreaId = researchAreaId
            };

            _context.SupervisorPreferences.Add(preference);
            await _context.SaveChangesAsync();

            return Ok(new
            {
                preference.Id,
                preference.ResearchAreaId,
                ResearchAreaName = (await _context.ResearchAreas
                    .FindAsync(researchAreaId))!.Name
            });
        }

        //DELETE: api/supervisor/preferences/{researchAreaId}
        [HttpDelete("preferences/{researchAreaId}")]
        public async Task<IActionResult> RemovePreference(int researchAreaId)
        {
            var supervisorId = GetSupervisorId();
            if (supervisorId == null)
                return Unauthorized("Invalid token.");

            var preference = await _context.SupervisorPreferences
                .FirstOrDefaultAsync(sp => sp.SupervisorId == supervisorId
                                        && sp.ResearchAreaId == researchAreaId);
            if (preference == null)
                return NotFound("Preference not found.");

            _context.SupervisorPreferences.Remove(preference);
            await _context.SaveChangesAsync();
            return Ok("Preference removed.");
        }

        //GET: api/supervisor/blind-review
        [HttpGet("blind-review")]
        public async Task<IActionResult> GetBlindReviewProposals()
        {
            var supervisorId = GetSupervisorId();
            if (supervisorId == null)
                return Unauthorized("Invalid token.");

            var preferredAreaIds = await _context.SupervisorPreferences
                .Where(sp => sp.SupervisorId == supervisorId)
                .Select(sp => sp.ResearchAreaId)
                .ToListAsync();

            if (!preferredAreaIds.Any())
                return Ok(new
                {
                    message = "No preferences set.",
                    proposals = new List<object>()
                });

            var proposals = await _context.Projects
                .Where(p => preferredAreaIds.Contains(p.ResearchAreaId)
                         && p.Status == "Pending"
                         && p.Match == null)
                .Select(p => new
                {
                    p.Id,
                    p.Title,
                    p.Abstract,
                    p.TechStack,
                    p.Status,
                    ResearchArea = p.ResearchArea.Name,
                    p.ResearchAreaId
                })
                .ToListAsync();

            return Ok(proposals);
        }
        [HttpPost("interest/{matchId}")]
public async Task<IActionResult> ExpressInterest(int matchId)
{
    var match = await _context.Matches.FindAsync(matchId);

    if (match == null)
        return NotFound(new { message = "Match not found" });

    if (match.Status == "confirmed")
        return BadRequest(new { message = "Match already confirmed" });

    match.SupervisorInterested = true;

    if (match.StudentInterested)
        match.Status = "mutual_interest";
    else
        match.Status = "supervisor_interested";

    await _context.SaveChangesAsync();

    return Ok(new
    {
        message = "Supervisor interest recorded successfully",
        match.Id,
        match.SupervisorInterested,
        match.StudentInterested,
        match.Status
    });
}

[HttpPost("confirm/{matchId}")]
public async Task<IActionResult> ConfirmMatch(int matchId)
{
    var match = await _context.Matches.FindAsync(matchId);

    if (match == null)
        return NotFound(new { message = "Match not found" });

    if (match.Status == "confirmed")
        return BadRequest(new { message = "Match already confirmed" });

    if (!match.SupervisorInterested || !match.StudentInterested)
        return BadRequest(new { message = "Both supervisor and student must express interest first" });

    match.Status = "confirmed";
    match.IsRevealed = true;

    await _context.SaveChangesAsync();

    return Ok(new
    {
        message = "Match confirmed and identity revealed",
        match.Id,
        match.Status,
        match.IsRevealed
    });
}

[HttpPost("create-test-match")]
public async Task<IActionResult> CreateTestMatch()
{
    var project = await _context.Projects.FirstOrDefaultAsync();
    var supervisor = await _context.Users
        .FirstOrDefaultAsync(u => u.Email == "admin@blindmatch.com");

    if (project == null)
    {
        return BadRequest(new { message = "No project found" });
    }

    if (supervisor == null)
    {
        return BadRequest(new { message = "No supervisor user found" });
    }

    var match = new Match
    {
        ProjectId = project.Id,
        SupervisorId = supervisor.Id,
        SupervisorInterested = false,
        StudentInterested = true,
        Status = "pending",
        IsRevealed = false,
        CreatedAt = DateTime.UtcNow
    };

    _context.Matches.Add(match);
    await _context.SaveChangesAsync();

    return Ok(new
    {
        message = "Test match created",
        match.Id
    });
}

[HttpPost("create-test-project")]
public async Task<IActionResult> CreateTestProject()
{
    var student = await _context.Users.FirstOrDefaultAsync();
    var researchArea = await _context.ResearchAreas.FirstOrDefaultAsync();

    if (student == null)
    {
        return BadRequest(new { message = "No user found to assign as student" });
    }

    if (researchArea == null)
    {
        return BadRequest(new { message = "No research area found" });
    }

    var project = new Project
    {
        Title = "Test Project",
        StudentId = student.Id,
        ResearchAreaId = researchArea.Id
    };

    _context.Projects.Add(project);
    await _context.SaveChangesAsync();

    return Ok(new
    {
        message = "Test project created",
        project.Id
    });
}

[HttpPost("create-test-research-area")]
public async Task<IActionResult> CreateTestResearchArea()
{
    var area = new ResearchArea
    {
        Name = "AI"
    };

    _context.ResearchAreas.Add(area);
    await _context.SaveChangesAsync();

    return Ok(new
    {
        message = "Test research area created",
        area.Id
    });
}
}
}







        