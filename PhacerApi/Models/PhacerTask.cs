namespace PhacerApi.Models;

public class PhacerTask
{
    public Guid Id { get; set; }
    public string Title { get; set; } = string.Empty;
    public string? Description { get; set; }
    public DateTime? DueDate { get; set; }
    public bool IsCompleted { get; set; }
    public TaskPriority Priority { get; set; } = TaskPriority.Medium;
    public TaskColor Color { get; set; } = TaskColor.Gray;
    public List<string> Tags { get; set; } = [];
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;

    public Guid UserId { get; set; }
    public User User { get; set; } = null!;
}

public enum TaskPriority
{
    Low,
    Medium,
    High
}

public enum TaskColor
{
    Gray,
    Red,
    Blue,
    Green,
    Yellow
}
