using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using Pharmacy.API.Data;
using Pharmacy.API.Models;
using Pharmacy.API.Interfaces;
using Pharmacy.API.Services;
using System.Security.Claims;
using System.Text;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.IdentityModel.Tokens;

var builder = WebApplication.CreateBuilder(args);

// Add services to the container.

builder.Services.AddControllers();
builder.Services.AddDbContext<ApplicationDbContext>(options =>
    options.UseSqlServer(builder.Configuration.GetConnectionString("DefaultConnection")));
builder.Services.AddDataProtection();
builder.Services
    .AddIdentityCore<ApplicationUser>(options => options.User.RequireUniqueEmail = true)
    .AddRoles<IdentityRole>()
    .AddEntityFrameworkStores<ApplicationDbContext>()
    .AddDefaultTokenProviders();
    builder.Services
    .AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
    .AddJwtBearer(options =>
    {
        options.TokenValidationParameters = new TokenValidationParameters
        {
            ValidateIssuer = true,
            ValidateAudience = true,
            ValidateLifetime = true,
            ValidateIssuerSigningKey = true,
            ValidIssuer = builder.Configuration["Jwt:Issuer"],
            ValidAudience = builder.Configuration["Jwt:Audience"],
            IssuerSigningKey = new SymmetricSecurityKey(
                Encoding.UTF8.GetBytes(builder.Configuration["Jwt:Key"]!)),
            RoleClaimType = ClaimTypes.Role,
            NameClaimType = ClaimTypes.Name
        };
    });
    builder.Services.AddCors(options =>
{
    options.AddPolicy("Frontend", policy => policy
        .WithOrigins("http://localhost:4200", "https://bisratesk.github.io")
        .AllowAnyHeader()
        .AllowAnyMethod());
});
builder.Services.AddAuthorization();
builder.Services.AddScoped<ITokenService, TokenService>();

// Learn more about configuring OpenAPI at https://aka.ms/aspnet/openapi
builder.Services.AddOpenApi();

var app = builder.Build();

// Configure the HTTP request pipeline.
if (app.Environment.IsDevelopment())
{
    app.MapOpenApi();
}

app.UseHttpsRedirection();

app.UseCors("Frontend");

app.UseAuthentication();

app.UseAuthorization();

app.MapControllers();
using (var scope = app.Services.CreateScope())
{
    var roles = scope.ServiceProvider.GetRequiredService<RoleManager<IdentityRole>>();
    foreach (var role in new[] { "Admin", "PharmacyOwner", "Customer" })
    {
        if (!await roles.RoleExistsAsync(role))
        {
            var result = await roles.CreateAsync(new IdentityRole(role));
            if (!result.Succeeded)
                throw new InvalidOperationException($"Could not create role '{role}': {string.Join("; ", result.Errors.Select(error => error.Description))}");
        }
    }

    var users = scope.ServiceProvider.GetRequiredService<UserManager<ApplicationUser>>();
    var adminEmail = builder.Configuration["Seed:AdminEmail"];
    var adminPassword = builder.Configuration["Seed:AdminPassword"];
    if (string.IsNullOrWhiteSpace(adminEmail) != string.IsNullOrWhiteSpace(adminPassword))
        throw new InvalidOperationException("Configure both Seed:AdminEmail and Seed:AdminPassword to seed an admin account.");

    if (!string.IsNullOrWhiteSpace(adminEmail) && !string.IsNullOrWhiteSpace(adminPassword)
        && await users.FindByEmailAsync(adminEmail) is null)
    {
        var admin = new ApplicationUser
        {
            UserName = adminEmail,
            Email = adminEmail,
            FullName = "System Admin"
        };
        var created = await users.CreateAsync(admin, adminPassword);
        if (!created.Succeeded)
            throw new InvalidOperationException($"Could not create admin user: {string.Join("; ", created.Errors.Select(error => error.Description))}");

        var roleResult = await users.AddToRoleAsync(admin, "Admin");
        if (!roleResult.Succeeded)
            throw new InvalidOperationException($"Could not assign the Admin role: {string.Join("; ", roleResult.Errors.Select(error => error.Description))}");
    }
}
app.Run();
