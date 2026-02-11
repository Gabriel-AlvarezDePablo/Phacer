using PhacerApi.Models;
using PhacerApi.Models.Tasks;

namespace PhacerApi.Services;

public interface ITaskService
{
    Task<TaskResponse?> CreateAsync(Guid userId, CreateTaskRequest request, CancellationToken cancellationToken = default);
    Task<IEnumerable<TaskResponse>> GetAllAsync(Guid userId, bool? isCompleted = null, string? search = null, int? priority = null, string? tag = null, CancellationToken cancellationToken = default);
    Task<TaskResponse?> GetByIdAsync(Guid userId, Guid taskId, CancellationToken cancellationToken = default);
    Task<TaskResponse?> UpdateAsync(Guid userId, Guid taskId, UpdateTaskRequest request, CancellationToken cancellationToken = default);
    Task<bool> DeleteAsync(Guid userId, Guid taskId, CancellationToken cancellationToken = default);
}
