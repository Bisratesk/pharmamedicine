namespace Pharmacy.API.Interfaces;

public interface IActivityService
{
    Task LogAsync(string message);
}
//what does the IActivityService interface do?The IActivityService interface defines a contract for logging activities within the Pharmacy API.
//  It contains a single method, 
// LogAsync, which takes a string message as a parameter.
//  This method is intended to be implemented by classes that will handle the logging of activities,
//  allowing for asynchronous logging operations. 
// The purpose of this interface is to provide a standardized way to log messages or activities, 
// which can be useful for monitoring, debugging, and auditing purposes within the application.