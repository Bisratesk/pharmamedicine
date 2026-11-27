namespace Pharmacy.API.Interfaces;

public interface IActivityService
{
    Task LogAsync(string message);
}
