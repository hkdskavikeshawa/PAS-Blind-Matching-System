using BlindMatchAPI.Data;
using BlindMatchAPI.Models;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using System.Text;
var builder = WebApplication.CreateBuilder(args);

// ── Database ──────────────────────────────────────────────
builder.Services.AddDbContext<AppDbContext>(options =>
    options.UseSqlServer(builder.Configuration.GetConnectionString("DefaultConnection")));

// ── Identity ──────────────────────────────────────────────
builder.Services.AddIdentity<ApplicationUser, IdentityRole>(options =>
{
    options.Password.RequireDigit = true;
    options.Password.RequiredLength = 6;
    options.Password.RequireUppercase = false;
    options.Password.RequireNonAlphanumeric = false;
})
.AddEntityFrameworkStores<AppDbContext>()
.AddDefaultTokenProviders();

// ── JWT Authentication ─────────────────────────────────────
var jwtKey = builder.Configuration["Jwt:Key"]!;
builder.Services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
.AddJwtBearer(options =>
{
    options.RequireHttpsMetadata = false;
    options.SaveToken = true;
    options.TokenValidationParameters = new TokenValidationParameters
    {
        ValidateIssuerSigningKey = true,
        IssuerSigningKey = new SymmetricSecurityKey(
            Encoding.UTF8.GetBytes(jwtKey)),
        ValidateIssuer = false,
        ValidateAudience = false,
        ValidateLifetime = true,
        ClockSkew = TimeSpan.Zero
    };
});

// ── CORS (allow React frontend) ────────────────────────────
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowReact", policy =>
    {
        policy.WithOrigins(
    "http://localhost:3000",
    "http://localhost:8080",
    "http://localhost:8081",
    "https://localhost:8080"
)
               .AllowAnyHeader()
              .AllowAnyMethod();
    });
});

// ── Controllers & Swagger ──────────────────────────────────
builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen(options =>
{
    options.AddSecurityDefinition("Bearer", new Microsoft.OpenApi.Models.OpenApiSecurityScheme
    {
        Name = "Authorization",
        Type = Microsoft.OpenApi.Models.SecuritySchemeType.ApiKey,
        Scheme = "Bearer",
        BearerFormat = "JWT",
        In = Microsoft.OpenApi.Models.ParameterLocation.Header,
        Description = "Enter: Bearer {your token}"
    });

    options.AddSecurityRequirement(new Microsoft.OpenApi.Models.OpenApiSecurityRequirement
    {
        {
            new Microsoft.OpenApi.Models.OpenApiSecurityScheme
            {
                Reference = new Microsoft.OpenApi.Models.OpenApiReference
                {
                    Type = Microsoft.OpenApi.Models.ReferenceType.SecurityScheme,
                    Id = "Bearer"
                }
            },
            new string[] {}
        }
    });
});

var app = builder.Build();

// ── Middleware Pipeline ────────────────────────────────────
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

//app.UseHttpsRedirection();
app.UseCors("AllowReact");
app.UseAuthentication();
app.UseAuthorization();
app.MapControllers();

// ── Database Seed ──────────────────────────────────────────
await SeedDatabaseAsync(app);

app.Run();

static async Task SeedDatabaseAsync(WebApplication app)
{
    using var scope = app.Services.CreateScope();
    var roleManager = scope.ServiceProvider.GetRequiredService<RoleManager<IdentityRole>>();
    var userManager = scope.ServiceProvider.GetRequiredService<UserManager<ApplicationUser>>();
    var context = scope.ServiceProvider.GetRequiredService<AppDbContext>();

    // ── Seed Roles ─────────────────────────────────────────
    foreach (var role in new[] { "Student", "Supervisor", "ModuleLeader", "SystemAdmin" })
    {
        if (!await roleManager.RoleExistsAsync(role))
            await roleManager.CreateAsync(new IdentityRole(role));
    }

    // ── Seed Research Areas ────────────────────────────────
    var areaData = new[]
    {
        ("Artificial Intelligence", "Machine learning, NLP, computer vision, and AI-driven systems"),
        ("Web Development", "Full-stack development, frontend frameworks, RESTful APIs"),
        ("Cybersecurity", "Network security, cryptography, ethical hacking, secure systems"),
        ("Cloud Computing", "AWS, Azure, serverless architectures, microservices"),
        ("Data Science", "Big data analytics, data visualization, statistical modelling"),
        ("Mobile Development", "iOS, Android, React Native, Flutter, cross-platform apps"),
        ("Internet of Things", "Embedded systems, sensor networks, smart devices"),
        ("Machine Learning", "Deep learning, reinforcement learning, neural networks"),
    };

    foreach (var (name, desc) in areaData)
    {
        if (!context.ResearchAreas.Any(r => r.Name == name))
        {
            context.ResearchAreas.Add(new ResearchArea { Name = name, Description = desc });
        }
    }
    await context.SaveChangesAsync();

    // Helper to get seeded area IDs by name
    var areas = context.ResearchAreas.ToDictionary(r => r.Name, r => r.Id);

    // ── Helper: create user + assign role ─────────────────
    async Task<ApplicationUser?> CreateUserAsync(string fullName, string email, string password, string role)
    {
        if (await userManager.FindByEmailAsync(email) is not null)
            return await userManager.FindByEmailAsync(email);

        var user = new ApplicationUser
        {
            FullName = fullName,
            UserName = email,
            Email = email,
            EmailConfirmed = true,
            Role = role,
        };
        var result = await userManager.CreateAsync(user, password);
        if (result.Succeeded)
            await userManager.AddToRoleAsync(user, role);
        return await userManager.FindByEmailAsync(email);
    }

    // ── Seed Students ──────────────────────────────────────
    var alice   = await CreateUserAsync("Alice Johnson",  "alice.j@uni.ac.uk",   "Student123!", "Student");
    var bob     = await CreateUserAsync("Bob Smith",      "bob.s@uni.ac.uk",     "Student123!", "Student");
    var charlie = await CreateUserAsync("Charlie Davis",  "charlie.d@uni.ac.uk", "Student123!", "Student");
    var diana   = await CreateUserAsync("Diana Evans",    "diana.e@uni.ac.uk",   "Student123!", "Student");

    // ── Seed Supervisors ───────────────────────────────────
    var sarah = await CreateUserAsync("Dr. Sarah Williams", "s.williams@uni.ac.uk", "Super123!", "Supervisor");
    var james = await CreateUserAsync("Prof. James Brown",  "j.brown@uni.ac.uk",    "Super123!", "Supervisor");
    var emily = await CreateUserAsync("Dr. Emily Clark",    "e.clark@uni.ac.uk",    "Super123!", "Supervisor");

    // ── Seed Module Leader ─────────────────────────────────
    await CreateUserAsync("Dr. Richard Moore", "r.moore@uni.ac.uk", "Leader123!", "ModuleLeader");

    // ── Seed Projects ──────────────────────────────────────
    var projectData = new[]
    {
        (
            Title: "AI-Powered Student Attendance System",
            Abstract: "This project proposes developing an intelligent attendance tracking system using facial recognition and machine learning. The system will automatically identify students entering a lecture hall and mark their attendance in real-time, reducing manual effort and increasing accuracy.",
            TechStack: "Python,TensorFlow,Flask,PostgreSQL",
            AreaName: "Artificial Intelligence",
            Student: alice
        ),
        (
            Title: "Secure E-Voting Platform for University Elections",
            Abstract: "A blockchain-inspired electronic voting system designed for university student union elections. The platform ensures vote integrity through cryptographic hashing, provides voter anonymity, and offers real-time result tabulation with an immutable audit trail.",
            TechStack: "ASP.NET Core,SQL Server,React,Docker",
            AreaName: "Cybersecurity",
            Student: bob
        ),
        (
            Title: "Cloud-Native Microservices for Library Management",
            Abstract: "This project aims to redesign the university library management system using a microservices architecture deployed on Azure. It will feature book cataloguing, reservation management, fine tracking, and integration with the university SSO system.",
            TechStack: "Node.js,Azure,Docker,Kubernetes,MongoDB",
            AreaName: "Cloud Computing",
            Student: charlie
        ),
        (
            Title: "IoT-Based Smart Campus Energy Monitor",
            Abstract: "Development of an IoT sensor network to monitor energy consumption across campus buildings. The system will collect real-time data from smart meters, analyse usage patterns using machine learning, and provide actionable insights through a web dashboard.",
            TechStack: "Python,Flask,React,PostgreSQL,AWS",
            AreaName: "Internet of Things",
            Student: diana
        ),
    };

    foreach (var p in projectData)
    {
        if (p.Student == null) continue;
        if (!areas.TryGetValue(p.AreaName, out var areaId)) continue;
        if (context.Projects.Any(pr => pr.Title == p.Title && pr.StudentId == p.Student.Id)) continue;

        context.Projects.Add(new Project
        {
            Title = p.Title,
            Abstract = p.Abstract,
            TechStack = p.TechStack,
            ResearchAreaId = areaId,
            StudentId = p.Student.Id,
            Status = "Pending",
        });
    }
    await context.SaveChangesAsync();

    // ── Seed Supervisor Preferences ────────────────────────
    async Task AddPrefAsync(ApplicationUser? supervisor, string areaName)
    {
        if (supervisor == null) return;
        if (!areas.TryGetValue(areaName, out var aId)) return;
        if (!context.SupervisorPreferences.Any(sp => sp.SupervisorId == supervisor.Id && sp.ResearchAreaId == aId))
        {
            context.SupervisorPreferences.Add(new SupervisorPreference
            {
                SupervisorId = supervisor.Id,
                ResearchAreaId = aId,
            });
        }
    }

    await AddPrefAsync(sarah, "Cloud Computing");
    await AddPrefAsync(sarah, "Web Development");
    await AddPrefAsync(james, "Artificial Intelligence");
    await AddPrefAsync(james, "Machine Learning");
    await AddPrefAsync(james, "Data Science");
    await AddPrefAsync(emily, "Cybersecurity");
    await AddPrefAsync(emily, "Mobile Development");
    await context.SaveChangesAsync();
}