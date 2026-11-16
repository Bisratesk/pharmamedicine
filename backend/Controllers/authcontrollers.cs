using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Pharmacy.API.DTOs;
using Pharmacy.API.Interfaces;
using Pharmacy.API.Models;

namespace Pharmacy.API.Controllers;

[ApiController]
[Route("api/auth")]
public class AuthController : ControllerBase
{
    private readonly UserManager<ApplicationUser> _users;
    private readonly ITokenService _tokens;

    public AuthController(UserManager<ApplicationUser> users, ITokenService tokens)
    {
        _users = users;
        _tokens = tokens;
    }

    [HttpPost("register")]
    public async Task<IActionResult> Register(RegisterRequest req)
    {
        // Admin can never self-register
        if (req.Role != "PharmacyOwner" && req.Role != "Customer")
            return BadRequest(new { message = "Role must be PharmacyOwner or Customer." });

        if (await _users.FindByEmailAsync(req.Email) is not null)
            return Conflict(new { message = "Email already registered." });

        var user = new ApplicationUser
        {
            UserName = req.Email,
            Email = req.Email,
            FullName = req.FullName
        };

        var result = await _users.CreateAsync(user, req.Password);
        if (!result.Succeeded)
            return BadRequest(new { message = string.Join(" ", result.Errors.Select(e => e.Description)) });

        await _users.AddToRoleAsync(user, req.Role);

        return StatusCode(201, new UserDto
        {
            Id = user.Id,
            FullName = user.FullName,
            Email = user.Email!,
            Role = req.Role
        });
    }

    [HttpPost("login")]
    public async Task<IActionResult> Login(LoginRequest req)
    {
        var user = await _users.FindByEmailAsync(req.Email);

        // Same message for "no such user" and "wrong password", so attackers learn nothing
        if (user is null || !await _users.CheckPasswordAsync(user, req.Password))
            return Unauthorized(new { message = "Invalid email or password." });

        var role = (await _users.GetRolesAsync(user)).FirstOrDefault() ?? "Customer";

        return Ok(new AuthResponse
        {
            Token = _tokens.CreateToken(user, role),
            User = new UserDto
            {
                Id = user.Id,
                FullName = user.FullName,
                Email = user.Email!,
                Role = role
            }
        });
    }
}