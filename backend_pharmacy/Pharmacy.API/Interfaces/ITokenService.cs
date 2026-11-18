using Pharmacy.API.Models;

namespace Pharmacy.API.Interfaces;

public interface ITokenService
{
    string CreateToken(ApplicationUser user, string role);
}
// The CreateToken method takes in an ApplicationUser object and a role string, and returns a JWT token as a string.