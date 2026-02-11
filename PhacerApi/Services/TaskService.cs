using Microsoft.EntityFrameworkCore;
using PhacerApi.Data;
using PhacerApi.Models;
using PhacerApi.Models.Tasks;

namespace PhacerApi.Services;

public class TaskService : ITaskService
{
    private readonly ApplicationDbContext _context;

    public TaskService(ApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<TaskResponse?> CreateAsync(Guid userId, CreateTaskRequest request, CancellationToken cancellationToken = default)
    {
        var task = new PhacerTask
        {
            Id = Guid.NewGuid(),
            UserId = userId,
            Title = request.Title.Trim(),
            Description = string.IsNullOrWhiteSpace(request.Description) ? null : request.Description.Trim(),
            DueDate = ToUtc(request.DueDate),
            Priority = request.Priority,
            Color = request.Color,
            Tags = request.Tags?.Select(t => t.Trim()).Where(t => !string.IsNullOrEmpty(t)).ToList() ?? []
        };

        _context.Tasks.Add(task);
        await _context.SaveChangesAsync(cancellationToken);

        return ToResponse(task);
    }

    public async Task<IEnumerable<TaskResponse>> GetAllAsync(Guid userId, bool? isCompleted = null, string? search = null, int? priority = null, string? tag = null, CancellationToken cancellationToken = default)
    {
        var query = _context.Tasks
            .Where(t => t.UserId == userId);

        if (isCompleted.HasValue)
            query = query.Where(t => t.IsCompleted == isCompleted.Value);

        if (!string.IsNullOrWhiteSpace(search))
        {
            var term = search.Trim().ToLower();
            query = query.Where(t => t.Title.ToLower().Contains(term) || (t.Description != null && t.Description.ToLower().Contains(term)));
        }

        if (priority.HasValue)
            query = query.Where(t => (int)t.Priority == priority.Value);

        var tasks = await query
            .OrderByDescending(t => t.CreatedAt)
            .ToListAsync(cancellationToken);

        if (!string.IsNullOrWhiteSpace(tag))
        {
            var tagLower = tag.Trim().ToLowerInvariant();
            tasks = tasks.Where(t => t.Tags.Any(tg => string.Equals(tg, tagLower, StringComparison.OrdinalIgnoreCase))).ToList();
        }

        return tasks.Select(ToResponse);
    }

    public async Task<TaskResponse?> GetByIdAsync(Guid userId, Guid taskId, CancellationToken cancellationToken = default)
    {
        var task = await _context.Tasks
            .FirstOrDefaultAsync(t => t.UserId == userId && t.Id == taskId, cancellationToken);

        return task == null ? null : ToResponse(task);
    }

    public async Task<TaskResponse?> UpdateAsync(Guid userId, Guid taskId, UpdateTaskRequest request, CancellationToken cancellationToken = default)
    {
        var task = await _context.Tasks
            .FirstOrDefaultAsync(t => t.UserId == userId && t.Id == taskId, cancellationToken);

        if (task == null)
            return null;

        task.Title = request.Title.Trim();
        task.Description = string.IsNullOrWhiteSpace(request.Description) ? null : request.Description.Trim();
        task.DueDate = ToUtc(request.DueDate);
        task.IsCompleted = request.IsCompleted;
        task.Priority = request.Priority;
        task.Color = request.Color;
        task.Tags = request.Tags?.Select(t => t.Trim()).Where(t => !string.IsNullOrEmpty(t)).ToList() ?? [];
        task.UpdatedAt = DateTime.UtcNow;

        await _context.SaveChangesAsync(cancellationToken);

        return ToResponse(task);
    }

    public async Task<bool> DeleteAsync(Guid userId, Guid taskId, CancellationToken cancellationToken = default)
    {
        var task = await _context.Tasks
            .FirstOrDefaultAsync(t => t.UserId == userId && t.Id == taskId, cancellationToken);

        if (task == null)
            return false;

        _context.Tasks.Remove(task);
        await _context.SaveChangesAsync(cancellationToken);
        return true;
    }

    private static DateTime? ToUtc(DateTime? value) =>
        value.HasValue
            ? value.Value.Kind == DateTimeKind.Utc
                ? value
                : DateTime.SpecifyKind(value.Value, DateTimeKind.Utc)
            : null;

    private static TaskResponse ToResponse(PhacerTask task) => new()
    {
        Id = task.Id,
        Title = task.Title,
        Description = task.Description,
        DueDate = task.DueDate,
        IsCompleted = task.IsCompleted,
        Priority = task.Priority,
        Color = task.Color,
        Tags = task.Tags,
        CreatedAt = task.CreatedAt,
        UpdatedAt = task.UpdatedAt
    };
}
