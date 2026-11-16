using Pharmacy.API.Models;

namespace Pharmacy.API.Interfaces;

public interface ITokenService
{
    string CreateToken(ApplicationUser user, string role);
}