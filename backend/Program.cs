using Microsoft.EntityFrameworkCore;
using backend.Data;
using Microsoft.Extensions.FileProviders;


var builder = WebApplication.CreateBuilder(args);

builder.Logging.ClearProviders();
builder.Logging.AddConsole();
builder.Logging.SetMinimumLevel(LogLevel.Debug);

builder.Services.AddDbContext<AppDbContext>(options =>
    options.UseSqlServer(builder.Configuration.GetConnectionString("DefaultConnection"))
           .LogTo(Console.WriteLine, LogLevel.Information) 
           .EnableSensitiveDataLogging());

builder.Services.AddControllers();


builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();


builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowReactApp",
        policy => policy
            .WithOrigins("http://localhost:3000", "http://localhost:5173")
            .AllowAnyMethod()
            .AllowAnyHeader());
});

var app = builder.Build();

// Log des requêtes entrantes
app.Use(async (context, next) =>
{
    Console.WriteLine($"📥 Requête: {context.Request.Method} {context.Request.Path}");
    await next();
    Console.WriteLine($"📤 Réponse: {context.Response.StatusCode}");
});

using (var scope = app.Services.CreateScope())
{
    try
    {
        var dbContext = scope.ServiceProvider.GetRequiredService<AppDbContext>();

        Console.WriteLine("🔍 Vérification de la base de données...");

        var created = dbContext.Database.EnsureCreated();
        Console.WriteLine(created ? "✅ Base créée" : "✅ Base existante");

        // Ajoute la colonne PronosticCloseMinutes si elle n'existe pas encore (base créée avant l'ajout du champ)
        dbContext.Database.ExecuteSqlRaw(@"
IF COL_LENGTH('dbo.Matches', 'PronosticCloseMinutes') IS NULL
BEGIN
    ALTER TABLE dbo.Matches ADD PronosticCloseMinutes INT NOT NULL
        CONSTRAINT DF_Matches_PronosticCloseMinutes DEFAULT 120;
END");
        // Autres colonnes du modèle qui peuvent manquer dans une base ancienne
        dbContext.Database.ExecuteSqlRaw(@"
IF COL_LENGTH('dbo.Teams', 'FlagPath') IS NULL
    ALTER TABLE dbo.Teams ADD FlagPath NVARCHAR(MAX) NULL;
IF COL_LENGTH('dbo.Users', 'Score') IS NULL
    ALTER TABLE dbo.Users ADD Score INT NOT NULL CONSTRAINT DF_Users_Score DEFAULT 0;
IF COL_LENGTH('dbo.Users', 'Role') IS NULL
    ALTER TABLE dbo.Users ADD Role NVARCHAR(MAX) NOT NULL CONSTRAINT DF_Users_Role DEFAULT 'user';");
        Console.WriteLine("✅ Colonnes PronosticCloseMinutes / FlagPath vérifiées");

        // ===================== DONNÉES DE TEST (matchs + pronostics) =====================
        try
        {
            var now = DateTime.Now;

            // 1) S'assurer que les équipes existent
            string[] teamNames = { "Tunisie", "Maroc", "France", "Brésil", "Espagne", "Allemagne",
                                   "Japon", "Sénégal", "Algérie", "Croatie", "Belgique", "Mexique",
                                   "Canada", "Qatar", "Uruguay", "Suisse" };
            foreach (var name in teamNames)
            {
                if (!dbContext.Teams.Any(t => t.Name == name))
                    dbContext.Teams.Add(new backend.Models.Team { Name = name });
            }
            dbContext.SaveChanges();
            int T(string n) => dbContext.Teams.First(t => t.Name == n).Id;

            // 2) Donner un score aux anciens matchs passés qui n'en ont pas
            var oldMatches = dbContext.Matches
                .Where(m => m.MatchDate != null && m.MatchDate < now.AddHours(-2) && (m.Score1 == null || m.Score2 == null))
                .ToList();
            foreach (var m in oldMatches)
            {
                m.Score1 = (m.Id * 7) % 4;   // scores "aléatoires" mais stables
                m.Score2 = (m.Id * 3) % 3;
            }
            if (oldMatches.Count > 0)
            {
                dbContext.SaveChanges();
                Console.WriteLine($"✅ Scores ajoutés à {oldMatches.Count} match(s) passé(s)");
            }

            // 3) Ajouter les nouveaux matchs de test (une seule fois)
            var testMatches = new (string t1, string t2, DateTime date, int? s1, int? s2)[]
            {
                // Matchs terminés
                ("Tunisie",  "Japon",    new DateTime(2026, 11,  1, 18, 0, 0), 2, 1),
                ("Maroc",    "Croatie",  new DateTime(2026, 11,  2, 21, 0, 0), 1, 1),
                ("France",   "Belgique", new DateTime(2026, 11,  5, 20, 0, 0), 3, 0),
                ("Brésil",   "Uruguay",  new DateTime(2026, 11,  8, 19, 0, 0), 0, 2),
                ("Espagne",  "Allemagne",new DateTime(2026, 11, 10, 20, 45, 0), 2, 2),
                ("Sénégal",  "Algérie",  new DateTime(2026, 11, 12, 17, 0, 0), 1, 0),
                // Matchs à venir
                ("Tunisie",  "Maroc",    now.Date.AddDays(2).AddHours(20), null, null),
                ("France",   "Brésil",   now.Date.AddDays(4).AddHours(21), null, null),
                ("Japon",    "Mexique",  now.Date.AddDays(6).AddHours(18), null, null),
                ("Canada",   "Qatar",    now.Date.AddDays(9).AddHours(16), null, null),
                ("Suisse",   "Espagne",  now.Date.AddDays(12).AddHours(20), null, null),
            };
            int added = 0;
            foreach (var tm in testMatches)
            {
                int id1 = T(tm.t1), id2 = T(tm.t2);
                DateTime d = tm.date;
                bool exists = tm.s1 != null
                    ? dbContext.Matches.Any(m => m.Team1Id == id1 && m.Team2Id == id2 && m.MatchDate == d)
                    : dbContext.Matches.Any(m => m.Team1Id == id1 && m.Team2Id == id2 && m.MatchDate > now);
                if (exists) continue;
                dbContext.Matches.Add(new global::Match
                {
                    Team1Id = id1, Team2Id = id2, MatchDate = tm.date,
                    Score1 = tm.s1, Score2 = tm.s2, PronosticCloseMinutes = 120
                });
                added++;
            }
            dbContext.SaveChanges();
            if (added > 0) Console.WriteLine($"✅ {added} match(s) de test ajouté(s)");

            // 4) Utilisateurs de test (si absents)
            foreach (var (login, pwd) in new[] { ("user1", "user123"), ("user2", "user123"), ("user3", "user123") })
            {
                if (!dbContext.Users.Any(u => u.Login == login))
                    dbContext.Users.Add(new backend.Models.User { Login = login, Password = pwd, Role = "user" });
            }
            dbContext.SaveChanges();

            // 5) Pronostics de test sur les matchs terminés (score exact / bon écart / bon vainqueur / raté)
            var players = dbContext.Users.Where(u => u.Role != "admin").ToList();
            var finished = dbContext.Matches.Where(m => m.Score1 != null && m.Score2 != null).ToList();
            int pAdded = 0;
            foreach (var u in players)
            {
                foreach (var m in finished)
                {
                    if (dbContext.Pronostics.Any(p => p.UserId == u.Id && p.MatchId == m.Id)) continue;
                    int r1 = m.Score1!.Value, r2 = m.Score2!.Value;
                    int p1, p2;
                    switch ((u.Id + m.Id) % 4)
                    {
                        case 0: p1 = r1; p2 = r2; break;                       // score exact -> 3 pts
                        case 1: p1 = r1 + 1; p2 = r2 + 1; break;               // bon écart -> 2 pts
                        case 2:                                                // bon vainqueur seulement -> 1 pt
                            if (r1 > r2) { p1 = r1 + 2; p2 = r2; }
                            else if (r1 < r2) { p1 = r1; p2 = r2 + 2; }
                            else { p1 = r1 + 1; p2 = r1 + 1; }                 // nul -> autre nul
                            break;
                        default: p1 = r2; p2 = r1 + 1; break;                  // pronostic raté (souvent 0 pt)
                    }
                    dbContext.Pronostics.Add(new backend.Models.Pronostic { UserId = u.Id, MatchId = m.Id, Score1 = p1, Score2 = p2 });
                    pAdded++;
                }
            }
            dbContext.SaveChanges();
            if (pAdded > 0) Console.WriteLine($"✅ {pAdded} pronostic(s) de test ajouté(s)");
        }
        catch (Exception exSeed)
        {
            Console.WriteLine($"❌ Erreur données de test: {exSeed.Message}");
        }
        // ==================================================================================

        Console.WriteLine($"📊 Users: {dbContext.Users.Count()} utilisateurs");
        Console.WriteLine($"📊 Teams: {dbContext.Teams.Count()} équipes");
        Console.WriteLine($"📊 Matches: {dbContext.Matches.Count()} matchs");
        Console.WriteLine($"📊 Pronostics: {dbContext.Pronostics.Count()} pronostics");

        if (!dbContext.Users.Any())
        {
            Console.WriteLine("➕ Ajout de données de test...");

            if (!dbContext.Teams.Any())
            {
                dbContext.Teams.AddRange(
                    new backend.Models.Team { Name = "France" },
                    new backend.Models.Team { Name = "Maroc" },
                    new backend.Models.Team { Name = "Bresil" },
                    new backend.Models.Team { Name = "Argentine" }
                );
            }

            dbContext.Users.AddRange(
                new backend.Models.User { Login = "admin", Password = "admin123", Score = 100, Role = "admin" },
                new backend.Models.User { Login = "user1", Password = "user123", Score = 50, Role = "user" },
                new backend.Models.User { Login = "user2", Password = "user123", Score = 75, Role = "user" }
            );

            await dbContext.SaveChangesAsync();
            Console.WriteLine("✅ Données de test ajoutées");
        }
    }
    catch (Exception ex)
    {
        Console.WriteLine($"❌ Erreur seed data: {ex.Message}");
    }
}

// Configuration du pipeline
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
    Console.WriteLine("🔧 Mode développement activé");
}

app.UseHttpsRedirection();
app.UseCors("AllowReactApp");
app.UseAuthorization();

app.Use(async (context, next) =>
{
    await next();

    if (context.Response.StatusCode == 404 && !context.Request.Path.StartsWithSegments("/swagger"))
    {
        Console.WriteLine($"❌ Route non trouvée: {context.Request.Method} {context.Request.Path}");
    }
});

app.MapControllers();

app.MapGet("/api/health", () => new
{
    status = "OK",
    timestamp = DateTime.Now,
    message = "API .NET fonctionne"
});

app.MapGet("/api/routes", () =>
{
    var routes = new[]
    {
        "GET    /api/health",
        "GET    /api/routes",
        "GET    /api/users",
        "GET    /api/users/{id}",
        "POST   /api/users",
        "DELETE /api/users/{id}",
        "GET    /api/teams",
        "POST   /api/teams",
        "DELETE /api/teams/{id}",
        "GET    /api/matches",
        "POST   /api/matches",
        "DELETE /api/matches/{id}",
        "GET    /api/pronostics",
        "GET    /api/pronostics/user/{id}",
        "GET    /api/pronostics/match/{id}",
        "POST   /api/pronostics",
        "DELETE /api/pronostics/{id}"
    };

    return routes;
});
app.UseStaticFiles(); 
var flagsPath = Path.Combine(app.Environment.WebRootPath, "flags");
if (!Directory.Exists(flagsPath))
    Directory.CreateDirectory(flagsPath);

app.UseStaticFiles(new StaticFileOptions
{
    FileProvider = new PhysicalFileProvider(flagsPath),
    RequestPath = "/flags"
});
Console.WriteLine("🚀 Démarrage de l'API...");
Console.WriteLine($"📡 URL: {app.Urls}");
Console.WriteLine("🔗 Routes disponibles:");
Console.WriteLine("- /api/health");
Console.WriteLine("- /api/routes");
Console.WriteLine("- /api/users");
Console.WriteLine("- /api/teams");
Console.WriteLine("- /api/matches");
Console.WriteLine("- /api/pronostics");

app.Run();