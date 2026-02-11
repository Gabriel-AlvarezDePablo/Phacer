using PhacerApi.Models;
using PhacerApi.Models.Auth;

namespace PhacerApi.Services;

public interface IAuthService
{
    Task<AuthResponse?> RegisterAsync(RegisterRequest request, CancellationToken cancellationToken = default);
    Task<AuthResponse?> LoginAsync(LoginRequest request, CancellationToken cancellationToken = default);
}
