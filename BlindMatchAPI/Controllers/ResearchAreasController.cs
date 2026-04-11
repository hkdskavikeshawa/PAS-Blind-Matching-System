using BlindMatchAPI.Data;
using BlindMatchAPI.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace BlindMatchAPI.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class ResearchAreasController : ControllerBase
    {
        private readonly AppDbContext _context;

        public ResearchAreasController(AppDbContext context)
        {
            _context = context;
        }

        // GET: api/researchareas - Anyone can view
        [HttpGet]
        public async Task<IActionResult> GetAll()
        {
            var areas = await _context.ResearchAreas.ToListAsync();
            return Ok(areas);
        }

        // POST: api/researchareas - Module Leader only
        [HttpPost]
        [Authorize(Roles = "ModuleLeader")]
        public async Task<IActionResult> Create([FromBody] ResearchArea area)
        {
            if (string.IsNullOrWhiteSpace(area.Name))
                return BadRequest("Research area name is required.");

            _context.ResearchAreas.Add(area);
            await _context.SaveChangesAsync();
            return Ok(area);
        }

        // DELETE: api/researchareas/1 - Module Leader only
        [HttpDelete("{id}")]
        [Authorize(Roles = "ModuleLeader")]
        public async Task<IActionResult> Delete(int id)
        {
            var area = await _context.ResearchAreas.FindAsync(id);
            if (area == null)
                return NotFound("Research area not found.");

            _context.ResearchAreas.Remove(area);
            await _context.SaveChangesAsync();
            return Ok("Research area deleted.");
        }
    }
}